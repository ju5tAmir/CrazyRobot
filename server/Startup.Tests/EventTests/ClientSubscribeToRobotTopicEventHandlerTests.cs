using System.Text.Json;
using System.Threading.Tasks;
using Api.Websocket.ClientDto;
using Api.Websocket.EventHandlers;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.timer;
using Application.Services;
using Infrastructure.Mqtt;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using Startup;
using Startup.Tests.TestUtils;

namespace Startup.Tests.EventTests;
[NonParallelizable]
[TestFixture]
public class ClientSubscribeToRobotTopicWsTests : IAsyncDisposable
{
    private WebApplicationFactory<Program> _factory = null!;
    private TestWsClient _wsClient = null!;

    [SetUp]
    public void SetUp()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                // 1) add both AppOptions and the "Mqtt" section
                ApiTestSetupUtilities.ConfigureTestHost(builder);

                builder.ConfigureAppConfiguration((ctx, cfg) =>
                {
                    cfg.AddInMemoryCollection(new Dictionary<string, string>
                    {
                        { "Mqtt:RobotOwner", "robotTopicTest" }       
                    });
                });

                builder.ConfigureServices(services =>
                {
                    // ─► mock IClientTimerService
                    services.RemoveAll<IClientTimerService>();
                    var timerMock = new Mock<IClientTimerService>();
                    timerMock.Setup(t => t.StartClientWatchdogTimer(
                        It.IsAny<string>(),
                        It.IsAny<TimeSpan>()));
                    services.AddSingleton<IClientTimerService>(timerMock.Object);

                    // standard DI registrations
                    services.DefaultTestConfig();

                    // remove MqttHostedService
                    services.RemoveAll<MqttHostedService>();
                });
            });

        // WebSocket client with DI
        _wsClient = _factory.Services
            .CreateScope().ServiceProvider
            .GetRequiredService<TestWsClient>();
    }
    public async ValueTask DisposeAsync()
    {
        if (_factory != null)
        {
            await _factory.DisposeAsync();
        }
        
        GC.SuppressFinalize(this);
    }
    [TearDown]
    public async Task TearDown()
    {
        await _wsClient.DisconnectAsync();
        await _factory.DisposeAsync();
    }

    [Test]
    public async Task WhenClientSubscribesToRobotTopic_ServerRepliesSubscribedTrue()
    {
        // Arrange ─ make the topic empty (if there is something there)
        var connMgr = _factory.Services.GetRequiredService<IConnectionManager>();
        var mqttOpt = _factory.Services.GetRequiredService<IOptionsMonitor<MqttOptions>>().CurrentValue;
        var topicId = mqttOpt.RobotOwner;
        var members = await connMgr.GetMembersFromTopicId(topicId);
        foreach (var member in members)
            await connMgr.RemoveFromTopic(topicId, member);

        var dto = new ClientSubscribeToRobotTopicDto
        {
            clientId  = _wsClient.WsClientId,
            requestId = "req-sub-1",
            eventType = nameof(ClientSubscribeToRobotTopicDto)
        };
        var payload = JsonSerializer.Serialize(dto);

        // Act ─ send JSON to WS
        _wsClient.WsClient.Send(payload);
        await Task.Delay(300);   // let the server process

        // Assert  
        Assert.That(_wsClient.ReceivedMessages.TryDequeue(out var raw), Is.True,
            "Waiting for a response from the server");

        var serverDto = JsonSerializer.Deserialize<ServerSubscribedClientToRobotTopicDto>(
            raw,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.That(serverDto, Is.Not.Null, "Deserialization failed");
        Assert.That(serverDto!.subscribed, Is.True,  "subscribed must be true");
        Assert.That(serverDto.eventType,  Is.EqualTo(nameof(ServerSubscribedClientToRobotTopicDto)));
        Assert.That(serverDto.requestId,  Is.EqualTo(dto.requestId));

        // Make sure the client is actually added to the topic
        var newMembers = await connMgr.GetMembersFromTopicId(topicId);
        Assert.That(newMembers, Does.Contain(_wsClient.WsClientId));
    }
}
