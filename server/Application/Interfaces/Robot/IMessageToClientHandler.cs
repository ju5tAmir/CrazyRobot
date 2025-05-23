using Core.Domain.Entities.Robot;

namespace Application.Interfaces.Robot;

public interface IMessageToClientHandler<T>
{
    Task HandleCommand(string topic, ClientCommand<T> command);
}