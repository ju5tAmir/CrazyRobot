

namespace Application.Interfaces.Robot;

public interface IServiceTimerNotifier
{
   void SendTimerNotification(string clientId);
}