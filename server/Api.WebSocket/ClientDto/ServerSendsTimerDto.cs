using WebSocketBoilerplate;

namespace Api.Websocket.ClientDto;

public class ServerSendsTimerDto:BaseDto
{
    public bool status { get; set; }
    public string clientId { get; set; }
}    