using Api.WebSocket.ClientDto.robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Services;
using Core.Domain.Entities.Robot;
using Microsoft.Extensions.Options;

namespace Api.WebSocket.EventHandlers.Robot.DangerControll;

public class NegativeSpaceNotifierHandler(IConnectionManager connectionManager,IOptionsMonitor<MqttOptions> mqttOptions):IClientNegativeDistanceNotifier
{
    public Task SendNegativeDistanceWarningToClient(string topic,NegativeDistanceWarning  negativeclientcommand)
    {
        var response = new ClientCommand<NegativeDistanceWarning>()
        {
            CommandType = ClientCommandType.NegativeWarning,
            Payload = negativeclientcommand
            
        };

        var responseDto = new NegativeDistanceNotifierDto()
        {
            command = response,
            eventType = nameof(NegativeDistanceNotifierDto),
            requestId = Guid.NewGuid().ToString()

        };
        Console.WriteLine("topic from negative handler" + topic  );
        connectionManager.BroadcastToTopic(topic, responseDto);
        return Task.CompletedTask;
    }
    
}