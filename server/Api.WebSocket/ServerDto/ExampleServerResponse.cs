using WebSocketBoilerplate;

namespace Api.Websocket.ServerDto;

/// <summary>
///     on the BaseDto there is eventType string so no need to define it here
///     but when you want to send this object it should look like:
///     {
///     "eventType": "ExampleClientDto",
///     "SomethingTheClientSends": "hello world"
///     }
/// </summary>
public class ExampleServerResponse : BaseDto
{
    public string SomethingTheServerSends { get; set; }
}