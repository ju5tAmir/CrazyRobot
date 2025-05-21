using Api.Websocket.ClientDto;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.timer;
using Application.Services;
using Fleck;
using Microsoft.Extensions.Options;
using WebSocketBoilerplate;

namespace Api.Websocket.EventHandlers;

public class ServerSubscribedClientToRobotTopicDto : BaseDto
{
    public bool subscribed { get; set; }
}

public class ClientSubscribeToRobotTopicEventHandler(
    IConnectionManager manager,
    IOptionsMonitor<MqttOptions> mqttOptions,IClientTimerService timerservice)
    : BaseEventHandler<ClientSubscribeToRobotTopicDto>
{
    public override async Task Handle(ClientSubscribeToRobotTopicDto dto, IWebSocketConnection socket)
    {
        
        Console.WriteLine("I am subscribing to the robot topic");
        
        var topicId = mqttOptions.CurrentValue.RobotOwner;
        var topicMembers = await manager.GetMembersFromTopicId(topicId);

        var isAlreadySubscribed = topicMembers.Contains(dto.clientId);
        var isTopicFree = topicMembers.Count == 0;

        var response = new ServerSubscribedClientToRobotTopicDto
        {
            requestId = dto.requestId,
            eventType = nameof(ServerSubscribedClientToRobotTopicDto),
            subscribed = isAlreadySubscribed || isTopicFree
        };

        if (response.subscribed && !isAlreadySubscribed)
        {
            await manager.AddToTopic(topicId, dto.clientId);
            await manager.SubscribeToDefaultTopics(dto.clientId);
          timerservice.StartClientWatchdogTimer(dto.clientId,TimeSpan.FromMinutes(1));
        }
        socket.SendDto(response);
    }
}
