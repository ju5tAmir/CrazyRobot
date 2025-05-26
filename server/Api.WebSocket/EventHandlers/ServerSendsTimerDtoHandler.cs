using Api.Websocket.ClientDto;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Fleck;
using WebSocketBoilerplate;

namespace Api.Websocket.EventHandlers;

public class ServerSendsTimerDtoHandler(IConnectionManager connectionManager) : IServiceTimerNotifier
{
    public void SendTimerNotification(string clientId)
    {
        try
        {
            IWebSocketConnection webSocket = (IWebSocketConnection)connectionManager.GetSocketFromClientId(clientId);

            var request = new ServerSendsTimerDto()
            {
                status = true,
                clientId = clientId,
                eventType = nameof(ServerSendsTimerDto),
                requestId = Guid.NewGuid().ToString()
            };
            webSocket.SendDto(request);
        }
        catch (Exception e)
        {
            Console.WriteLine($"[ServerSendsTimerDtoHandler] Client {clientId} not found or already disconnected.");  
        }


    }
}