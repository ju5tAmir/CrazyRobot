
using Api.WebSocket.ClientDto.robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Services;
using Core.Domain.Entities.Robot;
using Microsoft.Extensions.Options;


namespace Api.Websocket.EventHandlers.Robot.EngineControll;

public class InitializeEngineResponseHandler(IConnectionManager connectionManager,IOptionsMonitor<MqttOptions> mqttOptions):IClientNotifier
{
    // public override Task Handle(InitializeEnginResponseDto dto, IWebSocketConnection socket)
    // // {
    // //     connectionManager.BroadcastToTopic(mqttOptions.CurrentValue.PublishCommandsTopic,"ana are mere");
    // //     return Task.CompletedTask;
    // // }

    public Task SendEngineStatusToClient(bool status,string errorMessage)
    {
        var clientCommand = new ClientCommand<InitializeEngineResponse>()
        {
            CommandType = ClientCommandType.Initialized,
            Payload = new InitializeEngineResponse()
            {
                InitializeEngine = status,
                ErrorMessage = errorMessage
            }
        };
        var response = new InitializeEnginResponseDto
        {
            command = clientCommand,
            eventType = nameof(InitializeEnginResponseDto),
            requestId = Guid.NewGuid().ToString()
        };

         
        connectionManager.BroadcastToTopic(
            mqttOptions.CurrentValue.SubscribeEngineTopic,
            response
        );
     

        return Task.CompletedTask;
    }
}