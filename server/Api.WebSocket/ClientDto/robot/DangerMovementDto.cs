using Core.Domain.Entities.Robot;
using WebSocketBoilerplate;

namespace Api.WebSocket.ClientDto.robot;

public class DangerMovementDto:BaseDto
{
    public ClientCommand<DistanceWarning> command { get; set; }
}