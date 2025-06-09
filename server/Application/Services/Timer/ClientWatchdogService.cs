using Application.Interfaces.Infrastructure.Websocket;
using Application.Interfaces.Robot;
using Application.Interfaces.timer;
using Application.Models;
using Core.Domain.Entities.Robot;

namespace Application.Services.Timer;

public class ClientWatchdogService : IClientTimerService

{
    private readonly IConnectionManager _connectionManager;
    private readonly IRobotEngineService _robotEngineService;
    private readonly IServiceTimerNotifier _servicetimeNotifier;
    private readonly IForcedDisconnectedNotifier _disconnectedNotifier;
    
    public ClientWatchdogService(IConnectionManager connectionManager ,IRobotEngineService robotEngineService,IServiceTimerNotifier servicetimeNotifier,IForcedDisconnectedNotifier disconnected)
    {
        _connectionManager = connectionManager;
        _robotEngineService = robotEngineService;
        _servicetimeNotifier = servicetimeNotifier;
        _disconnectedNotifier = disconnected;
    }

    public void StartClientWatchdogTimer(string clientId, TimeSpan interval)
    {
        StopClientWatchdog(clientId); 
        var timer = new System.Threading.Timer(_ => TriggerClientConfirmation(clientId), null, interval, Timeout.InfiniteTimeSpan);
        var clientWatch = new ClientWatchdogState() { ActiveTimer = timer };
        
        _connectionManager.AddTimerToConnection(clientId,clientWatch);
    }

    public void StopClientWatchdog(string clientId)
    {
        if (_connectionManager.RemoveTimerToConnection(clientId, out var state))
        {
            state.ActiveTimer?.Dispose();
            state.ConfirmationTimeoutCts?.Cancel();
        }
    }

private async void TriggerClientConfirmation(string clientId)
    {
        var cts = new CancellationTokenSource();
        var connectionTimerState = await _connectionManager.GetTimerForConnection(clientId);
        connectionTimerState!.ConfirmationTimeoutCts= cts;
       _servicetimeNotifier.SendTimerNotification(clientId);
       try
       {
           await Task.Delay(TimeSpan.FromMinutes(1), cts.Token);
           await _disconnectedNotifier.SendDisconnectedMessage(clientId);
           await _connectionManager.RemoveAndCloseConnection(clientId);
           var engineState = new EngineManagement() { Engine = false };
           var engineCommand = new Command<EngineManagement>()
           {
               CommandType = CommandType.Initialize,
               Payload = engineState
           };
           await _robotEngineService.ManageEngine(engineCommand);
       }
       catch (TaskCanceledException)
       {
           Console.WriteLine($"Client {clientId} confirmed before timeout.");
       }
       
    }
    public async Task<bool> RegisterClientResponse(string clientId)
    {
      
        
        var connectionTimerState = await _connectionManager.GetTimerForConnection(clientId);

        if (connectionTimerState == null)
            return false;
        try
        {
            StartClientWatchdogTimer(clientId, TimeSpan.FromMinutes(5));
            return true;
        }
        catch (ObjectDisposedException)
        {
            return false;
        }
    }

}