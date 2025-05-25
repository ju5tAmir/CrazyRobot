using Core.Domain.Entities.Robot;

namespace Application.Interfaces.Robot;

public interface IServoService
{
    Task ManageServos (Command<ServoCommand> command);
}