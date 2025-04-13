using Api.Websocket.ClientDto;
using Api.Websocket.ServerDto;
using Fleck;
using WebSocketBoilerplate;

namespace Api.Websocket.EventHandlers;

public class ExampleEventHandler : BaseEventHandler<ExampleClientDto>
{
    public override Task Handle(ExampleClientDto dto, IWebSocketConnection socket)
    {
        //you can access the dto like: dto.SomethingTheClientSends; 

        //when sending response to the Typescript client using sendRequest, remember to attach requestId like below: (not for broadcasts)
        socket.SendDto(new ExampleServerResponse { SomethingTheServerSends = "hi you", requestId = dto.requestId });

        throw new Exception("This will be caught by the global exception handler and returned to the client");
    }
}