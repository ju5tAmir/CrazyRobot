using System;
using System.Text.Json;
using System.Threading.Tasks;
using Api.Websocket.ClientDto;
using Application.Interfaces.Robot;
using Core.Domain.Entities.Robot;
using Infrastructure.Mqtt;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using NUnit.Framework;
using Startup;
using Startup.Tests.TestUtils;

namespace Startup.Tests.EventTests;
[NonParallelizable]
[TestFixture]
public class EngineControllWsTests : IAsyncDisposable
{
    private WebApplicationFactory<Program>? _factory;
    private TestWsClient?                   _wsClient;
    private Mock<IRobotEngineService>?      _robotMock;

    /*───────────────  SETUP  ───────────────*/
    [SetUp]
    public void SetUp()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                // basic in-memory configuration (JwtSecret, Mqtt, etc.)
                ApiTestSetupUtilities.ConfigureTestHost(builder);

                builder.ConfigureServices(services =>
                {
                    /* 1) replace IRobotEngineService with a mock version */
                    services.RemoveAll<IRobotEngineService>();
                    _robotMock = new Mock<IRobotEngineService>();
                    _robotMock
                        .Setup(r => r.ManageEngine(It.IsAny<Command<EngineManagement>>()))
                        .Returns(Task.CompletedTask);
                    services.AddSingleton(_robotMock.Object);

                    /* 2) standard test services (DB-container, TestWsClient …) */
                    services.DefaultTestConfig();

                    /* 3) disable MqttHostedService so that it does not cling to an empty broker */
                    services.RemoveAll<MqttHostedService>();
                });
            });

        _wsClient = _factory.Services
            .CreateScope().ServiceProvider
            .GetRequiredService<TestWsClient>();
    }

    /*────────────── TEARDOWN ──────────────*/
    [TearDown]
    public async Task TearDown()
    {
        if (_wsClient is not null)
            await _wsClient.DisconnectAsync();

        if (_factory is not null)
            _factory.Dispose();
    }

    public async ValueTask DisposeAsync()
    {
        await TearDown();
        GC.SuppressFinalize(this);
    }

    /*──────────────   TEST   ──────────────*/
    [Test]
    public async Task WhenClientSendsEngineCommand_ServerReturnsSuccessTrue()
    {
        // payload: Engine = true
        var enginePayload = new EngineManagement { Engine = true };

        var cmd = new Command<EngineManagement>
        {
            Payload = enginePayload       
        };

        var dto = new EngineStateDto
        {
            command   = cmd,
            eventType = nameof(EngineStateDto),
            requestId = "req-engine-1"
        };

        _wsClient!.WsClient.Send(JsonSerializer.Serialize(dto));
        await Task.Delay(300);

        // ---------- response from server ----------
        Assert.That(_wsClient.ReceivedMessages.TryDequeue(out var raw), Is.True);

        var reply = JsonSerializer.Deserialize<ServerConfirmsDto>(
            raw, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.That(reply,            Is.Not.Null);
        Assert.That(reply!.Success,   Is.True);
        Assert.That(reply.eventType,  Is.EqualTo(nameof(EngineStateDto)));
        Assert.That(reply.requestId,  Is.EqualTo(dto.requestId));

        // ---------- service call check ----------
        _robotMock!.Verify(r =>
                r.ManageEngine(It.Is<Command<EngineManagement>>(c =>
                        c.Payload.Engine == enginePayload.Engine    
                )),
            Times.Once,
            "ManageEngine must be called once with the passed EngineManagement");
    }
    
}
