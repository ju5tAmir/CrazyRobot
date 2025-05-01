using Api.Websocket.ClientDto;
using Api.WebSocket.ClientDto.robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Fleck;
using WebSocketBoilerplate;

namespace Api.Websocket.EventHandlers.Robot.MovementControll;

public class MovementControllHandler(IConnectionManager connectionManager,IRobotEngineService robotService):BaseEventHandler<RobotMovementDto>
{
    public override async Task Handle(RobotMovementDto dto, IWebSocketConnection socket)
    {
        Console.WriteLine(dto.command.CommandType +"command");
        Console.Write(dto.command.Payload.Directions.ActiveMovements.Count);
        
        await robotService.ManageMovement(dto.command);
        socket.SendDto(new ServerConfirmsDto() { Success = true , eventType = dto.eventType,requestId = dto.requestId});
    }
}