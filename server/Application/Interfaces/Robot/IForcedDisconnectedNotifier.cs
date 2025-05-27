namespace Application.Interfaces.Robot;

public interface IForcedDisconnectedNotifier
{
    Task SendDisconnectedMessage(string clientId);
}