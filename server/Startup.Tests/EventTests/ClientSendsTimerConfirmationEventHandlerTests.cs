using System.Text.Json;
using System.Threading.Tasks;
using Api.Websocket.ClientDto;
using Application.Interfaces.timer;
using Infrastructure.Mqtt;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using NUnit.Framework;
using Startup;
using Startup.Tests.TestUtils;
using WebSocketBoilerplate;

namespace Startup.Tests.EventTests;
[NonParallelizable]
[TestFixture]
public class ClientSendsTimerConfirmationWsTests : IAsyncDisposable
{
    private WebApplicationFactory<Program> _factory = null!;
    private TestWsClient _wsClient = null!;

    [SetUp]
    public void SetUp()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                ApiTestSetupUtilities.ConfigureTestHost(builder);

                builder.ConfigureServices(services =>
                {
                    // 1) immediately put the mok
                    services.RemoveAll<IClientTimerService>();
                    var timerMock = new Mock<IClientTimerService>();
                    timerMock.Setup(x => x.RegisterClientResponse(It.IsAny<string>()))
                        .ReturnsAsync(false);
                    services.AddSingleton<IClientTimerService>(timerMock.Object);

                    // 2) then all the standard test DI
                    services.DefaultTestConfig();

                    // 3) remove MqttHostedService so that it does not connect
                    services.RemoveAll<MqttHostedService>();
                });
            });

        _wsClient = _factory.Services
            .CreateScope().ServiceProvider
            .GetRequiredService<TestWsClient>();
    }

    [TearDown]
    public async Task TearDown()
    {
        if (_wsClient != null)
        {
            await _wsClient.DisconnectAsync();
        }
        if (_factory != null)
        {
            await _factory.DisposeAsync();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_wsClient != null)
        {
            await _wsClient.DisconnectAsync();
            _wsClient = null;
        }
        if (_factory != null)
        {
            await _factory.DisposeAsync();
            _factory = null;
        }
        GC.SuppressFinalize(this);
    }

    [Test]
    public async Task WhenClientSendsTimerConfirmation_ServerRepliesWithSuccessFalse()
    {
         
        var dto = new ClientSendsTimerConfirmationDto
        {
            clientId  = _wsClient.WsClientId,
            status    = true,
            requestId = "test-req-123",
            eventType = nameof(ClientSendsTimerConfirmationDto)   
        };
        var payload = JsonSerializer.Serialize(dto);

        // Act
        _wsClient.WsClient.Send(payload);
        await Task.Delay(300);      

        // Assert
        Assert.That(_wsClient.ReceivedMessages.TryDequeue(out var raw), Is.True,
            "Waiting for a response from the server");

        var serverDto = JsonSerializer.Deserialize<ServerConfirmsDto>(
            raw, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.That(serverDto, Is.Not.Null);
        Assert.That(serverDto!.Success,   Is.False);                 
        Assert.That(serverDto.eventType,  Is.EqualTo(nameof(ServerConfirmsDto)));
        Assert.That(serverDto.requestId,  Is.EqualTo(dto.requestId));
    }
}

