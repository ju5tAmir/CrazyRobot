namespace Application.Interfaces.Robot;

public interface IClientNotifierNew
{
    Task SendCommandsToClient(ClientCommandDto clientCommand);
}