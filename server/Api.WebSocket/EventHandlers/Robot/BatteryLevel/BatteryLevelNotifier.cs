using Api.WebSocket.ClientDto.robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Models.Dtos.robot;
using Application.Services;
using Microsoft.Extensions.Options;

namespace Api.Websocket.EventHandlers.Robot.BatteryLevel;

public class BatteryLevelNotifier(IConnectionManager connectionManager,IOptionsMonitor<MqttOptions> mqttOptions):IBatteryNotifier
{
    public Task SendBatteryInfoToClient(BatteryPercentage batteryPercentage)
    {
        var response = new BatteryLevelDto()
        {
            BatteryLevel = batteryPercentage.BatteryPercentageLevel,
            eventType = nameof(BatteryLevelDto),
            requestId = Guid.NewGuid().ToString()
        };
        connectionManager.BroadcastToTopic(mqttOptions.CurrentValue.BatteryLevelInfo,response);
      return Task.CompletedTask;
    }
}