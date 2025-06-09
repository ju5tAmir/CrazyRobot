

using Api.Websocket.ClientDto;
using Api.Websocket.ClientDto.robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Fleck;
using WebSocketBoilerplate;

public class EngineControllEventHandler(IConnectionManager connectionManager,IRobotEngineService robotService):BaseEventHandler<EngineStateDto>
{
    
    public override async Task Handle(EngineStateDto dto, IWebSocketConnection socket)
    {
        await robotService.ManageEngine(dto.command);
        socket.SendDto(new ServerConfirmsDto() { Success = true , eventType = nameof(ServerConfirmsDto),requestId = dto.requestId});
    }
    
}