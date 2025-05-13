using Core.Domain.Entities.Robot;
using WebSocketBoilerplate;

namespace Api.WebSocket.ClientDto.robot;

public class NegativeDistanceNotifierDto:BaseDto
{
    public ClientCommand<NegativeDistanceWarning> command { get; set; }
}