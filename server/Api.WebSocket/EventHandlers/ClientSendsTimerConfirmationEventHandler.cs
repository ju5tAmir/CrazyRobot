using Api.Websocket.ClientDto;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Interfaces.timer;
using Fleck;
using WebSocketBoilerplate;

namespace Api.Websocket.EventHandlers;

public class ClientSendsTimerConfirmationEventHandler(IConnectionManager connectionManager,IClientTimerService timerService):BaseEventHandler<ClientSendsTimerConfirmationDto>
{
    public override async  Task Handle(ClientSendsTimerConfirmationDto dto, IWebSocketConnection socket)
    {
        if (dto.status)
        {
           var success =  await timerService.RegisterClientResponse(dto.clientId);
            socket.SendDto(new ServerConfirmsDto()
            {
                Success = success,
                eventType = nameof(ServerConfirmsDto),
                requestId = dto.requestId
            });
            
        }
    }
}