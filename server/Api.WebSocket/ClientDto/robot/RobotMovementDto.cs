using Core.Domain.Entities.Robot;
using WebSocketBoilerplate;

namespace Api.WebSocket.ClientDto.robot;

public class RobotMovementDto:BaseDto
{
    public Command<MovementCommand> command { get; set; }
}