using Api.Websocket.ClientDto;
using Api.WebSocket.ClientDto.robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Fleck;
using WebSocketBoilerplate;

namespace Api.Websocket.EventHandlers.Robot.Servo;

public class ClientSendsServoCommandHandler(IConnectionManager connectionManager,IServoService servoManager):BaseEventHandler<ServoDto>
{
    public override async Task Handle(ServoDto dto, IWebSocketConnection socket)
    {
        await servoManager.ManageServos(dto.command);
        socket.SendDto(new ServerConfirmsDto() { Success = true , eventType = dto.eventType,requestId = dto.requestId});
    }
}