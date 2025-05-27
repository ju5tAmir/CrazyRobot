using WebSocketBoilerplate;

namespace Api.Websocket.ClientDto.robot;

public class ForceDisconnectedDto:BaseDto
{
    public string reason { get; set; } = "timeout";
}