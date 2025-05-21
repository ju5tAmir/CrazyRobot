using Core.Domain.Entities.Robot;
using WebSocketBoilerplate;

namespace Api.WebSocket.ClientDto.robot;

public class InitializeEnginResponseDto:BaseDto
{
    public ClientCommand<InitializeEngineResponse> command { get; set; }
}