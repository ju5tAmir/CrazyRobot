using Api.WebSocket.ClientDto.robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Services;
using Core.Domain.Entities.Robot;
using Microsoft.Extensions.Options;

namespace Api.Websocket.EventHandlers.Robot.MovementControll;

public class MovementResponseHandler(IConnectionManager connectionManager,IOptionsMonitor<MqttOptions> mqttOptions):IClientMovementNotifier
{
    public  Task SendDistanceWarningToClient(DistanceWarning distancewarning)
    {
        var response = new ClientCommand<DistanceWarning>()
        {
            CommandType = ClientCommandType.DistanceWarning,
            Payload = new DistanceWarning  
            {
                Warning = distancewarning.Warning,
            }
        };

        var responseDto = new DangerMovementDto()
        {
            command = response,
            eventType = nameof(DangerMovementDto),
            requestId = Guid.NewGuid().ToString()

        };
        
        connectionManager.BroadcastToTopic(mqttOptions.CurrentValue.DistanceWarningTopic, responseDto);
        return Task.CompletedTask;
    }
}