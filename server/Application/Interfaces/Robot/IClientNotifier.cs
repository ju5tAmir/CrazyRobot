namespace Application.Interfaces.Robot;

public interface IClientNotifier
{
    Task SendEngineStatusToClient(bool status,string errorMessage);
}