using Api.Websocket.EventHandlers.Robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Services;
using Core.Domain.Entities.Robot;
using Microsoft.Extensions.Options;

public class NegativeSpaceNotifierHandler(IConnectionManager connectionManager,IOptionsMonitor<MqttOptions> mqttOptions):IClientNegativeDistanceNotifier
{
    public Task SendNegativeDistanceWarningToClient(string topic,NegativeDistanceWarning  negativeclientcommand)
    {
        var response = new ClientCommand<NegativeDistanceWarning>()
        {
            CommandType = ClientCommandType.NegativeWarning,
            Payload = negativeclientcommand
            
        };

        connectionManager.BroadcastToTopic(topic, response);
        return Task.CompletedTask;
    }
    
}


 

