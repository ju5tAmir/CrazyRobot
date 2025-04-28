namespace Application.Interfaces.Robot;

public interface IRobotEngineService
{
   Task ManageEngine(bool engineState);
}