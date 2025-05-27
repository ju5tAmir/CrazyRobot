using Api.Websocket.ClientDto.robot;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Fleck;
using WebSocketBoilerplate;

namespace Api.Websocket.EventHandlers;

public class ForcedDisconnectNotifier(IConnectionManager connectionManager):IForcedDisconnectedNotifier
{
    public  Task SendDisconnectedMessage(string clientId)
    {
      
   

        try
        {
            var connection = connectionManager.GetSocketFromClientId(clientId) as IWebSocketConnection;
            if (connection == null)
            {
                Console.WriteLine($"[ForcedDisconnectNotifier] Client {clientId} not found or already disconnected.");
                return Task.CompletedTask;
            }
            var message = new ForceDisconnectedDto
            {
                eventType = nameof(ForceDisconnectedDto),
                reason = "Disconnected from the server as the time for activity confirmation expired!"
            };

            connection.SendDto(message);

        }
        catch (Exception e)
        {
            Console.WriteLine($"[ForcedDisconnectNotifier] Client {clientId} not found or already disconnected.");  
        }


        return Task.CompletedTask;
    }

}