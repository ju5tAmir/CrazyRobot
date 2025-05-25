using Core.Domain.Entities.Robot;
using WebSocketBoilerplate;

namespace Api.WebSocket.ClientDto.robot;

public class ServoDto:BaseDto
{
    public Command<ServoCommand> command { get; set; }
}