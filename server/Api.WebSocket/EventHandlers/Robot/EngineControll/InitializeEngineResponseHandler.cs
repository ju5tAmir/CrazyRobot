
using Api.WebSocket.ClientDto.robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Services;
using Core.Domain.Entities.Robot;
using Microsoft.Extensions.Options;


namespace Api.Websocket.EventHandlers.Robot.EngineControll;

public class InitializeEngineResponseHandler(IConnectionManager connectionManager,IOptionsMonitor<MqttOptions> mqttOptions):IClientNotifier
{
    public Task SendEngineStatusToClient(bool status, string errorMessage)
    {
        string parsedErrorMessage = string.Empty;

        if (InitErrorInfo.TryParse(errorMessage, out InitErrorCode code))
        {
            parsedErrorMessage = InitErrorInfo.GetMessage(code);
        }

        var clientCommand = new ClientCommand<InitializeEngineResponse>()
        {
            CommandType = ClientCommandType.Initialized,
            Payload = new InitializeEngineResponse()
            {
                InitializeEngine = status,
                ErrorMessage = parsedErrorMessage
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