using Application.Models;

namespace Application.Interfaces.timer;

public interface IClientTimerService
{
    void StartClientWatchdogTimer(string clientId, TimeSpan interval);
  
   Task<bool> RegisterClientResponse(string clientId);
   void StopClientWatchdog(string clientId);
}