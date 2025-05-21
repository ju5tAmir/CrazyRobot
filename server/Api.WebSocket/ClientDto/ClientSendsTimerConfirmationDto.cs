using WebSocketBoilerplate;

namespace Api.Websocket.ClientDto;

public class ClientSendsTimerConfirmationDto:BaseDto
{
    public bool status { get; set; }
    public string clientId { get; set; }
}