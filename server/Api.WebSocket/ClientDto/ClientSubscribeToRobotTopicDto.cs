using WebSocketBoilerplate;

namespace Api.Websocket.ClientDto;

public class ClientSubscribeToRobotTopicDto:BaseDto
{
    public string clientId { get; set; }
}