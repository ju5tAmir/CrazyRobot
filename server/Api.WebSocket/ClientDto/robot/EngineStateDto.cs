using Core.Domain.Entities.Robot;
using WebSocketBoilerplate;

namespace Api.Websocket.ClientDto;

public class EngineStateDto:BaseDto
{
    public Command<EngineManagement> command { get; set; }
}