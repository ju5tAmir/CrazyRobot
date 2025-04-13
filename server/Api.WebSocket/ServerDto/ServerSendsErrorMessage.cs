using WebSocketBoilerplate;

namespace Api.Websocket.ServerDto;

public class ServerSendsErrorMessage : BaseDto
{
    public string Message { get; set; }
}