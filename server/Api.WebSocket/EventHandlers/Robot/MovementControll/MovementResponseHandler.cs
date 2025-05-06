using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Services;
using Core.Domain.Entities.Robot;
using Microsoft.Extensions.Options;

namespace Api.Websocket.EventHandlers.Robot.MovementControll;

public class MovementResponseHandler(IConnectionManager connectionManager,IOptionsMonitor<MqttOptions> mqttOptions):IClientMovementNotifier
{
    public  Task SenddistancewarningToClient(DistanceWarning distancewarning)
    {
        connectionManager.BroadcastToTopic(mqttOptions.CurrentValue.DistanceWarningTopic, distancewarning);
        return Task.CompletedTask;
    }
}