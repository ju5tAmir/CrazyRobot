using Api.Websocket.ClientDto;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Interfaces.timer;
using Application.Services;
using Core.Domain.Entities.Robot;
using Fleck;
using Microsoft.Extensions.Options;
using WebSocketBoilerplate;

namespace Api.Websocket.EventHandlers;

public class ServerUnsubscribedClientFromRobotTopicDto : BaseDto
{
    public bool unsubscribed { get; set; }
}

public class ClientUnsubscribeFromRobotTopicEventHandler(IConnectionManager connectionManager,IOptionsMonitor<MqttOptions> mqttOptions,IRobotEngineService robotService,IClientTimerService timerService):BaseEventHandler<ClientUnsubscribeFromRobotTopicDto>
{
    public override Task Handle(ClientUnsubscribeFromRobotTopicDto dto, IWebSocketConnection socket)
    {
     
        Console.WriteLine("I am unsubscribing to the robot topic");
        connectionManager.RemoveFromTopic(mqttOptions.CurrentValue.RobotOwner, dto.clientId);
        connectionManager.RemoveFromDefaultTopics(dto.clientId);
        var engineState = new EngineManagement() { Engine = false };
        var engineCommand = new Command<EngineManagement>()
        {
            CommandType = CommandType.Stop,
            Payload = engineState
        };
        robotService.ManageEngine(engineCommand);
        timerService.StopClientWatchdog(dto.clientId);
        var response = new ServerUnsubscribedClientFromRobotTopicDto()
        {
            unsubscribed = true,
            requestId = dto.requestId,
            eventType = nameof(ServerUnsubscribedClientFromRobotTopicDto)
        };
        socket.SendDto(response);
        return Task.CompletedTask;
    }
}