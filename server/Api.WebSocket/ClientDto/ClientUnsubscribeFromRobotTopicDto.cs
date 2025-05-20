using WebSocketBoilerplate;

namespace Api.Websocket.ClientDto;

public class ClientUnsubscribeFromRobotTopicDto:BaseDto
{
    public string clientId { get; set; }
}