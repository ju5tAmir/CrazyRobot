using System.Text.Json;
using System.Threading.Tasks;
using Api.Websocket.ClientDto;
using Api.WebSocket.ClientDto.robot;           // ServoDto
using Application.Interfaces.Robot;           // IServoService
using Core.Domain.Entities.Robot;             // Command<T>, ServoCommand
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
public class ServoCommandWsTests : IAsyncDisposable
{
    private WebApplicationFactory<Program>? _factory;
    private TestWsClient?                   _wsClient;
    private Mock<IServoService>?            _servoMock;

    /*─────────────────── SETUP ───────────────────*/
    [SetUp]
    public void SetUp()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                // In-memory AppOptions & Mqtt
                ApiTestSetupUtilities.ConfigureTestHost(builder);

                builder.ConfigureServices(services =>
                {
                    /* 1️⃣  We are using IServoService */
                    services.RemoveAll<IServoService>();
                    _servoMock = new Mock<IServoService>();
                    _servoMock.Setup(s => s.ManageServos(It.IsAny<Command<ServoCommand>>()))
                              .Returns(Task.CompletedTask);
                    services.AddSingleton(_servoMock.Object);

                    /* 2️⃣  Basic DI configuration (DB, TestWsClient…)) */
                    services.DefaultTestConfig();

                    /* 3️⃣  Disable MQTT-HostedService*/
                    services.RemoveAll<MqttHostedService>();
                });
            });

        _wsClient = _factory.Services.CreateScope()
            .ServiceProvider.GetRequiredService<TestWsClient>();
    }

    /*───────────────── TEARDOWN ─────────────────*/
    [TearDown] public async Task TearDown() => await DisposeAsync();

    public async ValueTask DisposeAsync()
    {
        if (_wsClient is not null)
        {
            await _wsClient.DisconnectAsync();
            _wsClient = null;
        }
        _factory?.Dispose();
        _factory = null;
    }

    /*──────────────────  TEST  ──────────────────*/
    [Test]
    public async Task WhenClientSendsServoCommand_ServerReturnsSuccessTrue()
    {
        var command = new Command<ServoCommand> { Payload = new ServoCommand() };

        var dto = new ServoDto
        {
            command   = command,
            eventType = nameof(ServoDto),
            requestId = "req-servo-1"
        };

        _wsClient!.WsClient.Send(JsonSerializer.Serialize(dto));
        await Task.Delay(300);         // short pause for processing

        
        Assert.That(_wsClient.ReceivedMessages.TryDequeue(out var raw), Is.True,
            "Waiting for a response from the server");

        var reply = JsonSerializer.Deserialize<ServerConfirmsDto>(
            raw,
            (JsonSerializerOptions?)new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.That(reply,            Is.Not.Null);
        Assert.That(reply!.Success,   Is.True);
        Assert.That(reply.eventType,  Is.EqualTo(nameof(ServoDto)));
        Assert.That(reply.requestId,  Is.EqualTo(dto.requestId));

        /* ----- Checking the ManageServos call ----- */
        _servoMock!.Verify(s => s.ManageServos(It.IsAny<Command<ServoCommand>>()),
            Times.Once,
            "ManageServos must be called exactly once");
    }
}
