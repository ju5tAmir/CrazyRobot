﻿using Core.Domain.Entities.Robot;

namespace Application.Interfaces.Robot;

public interface IRobotEngineService
{
   Task ManageEngine(Command<EngineManagement> command);
   Task ManageMovement (Command<MovementCommand> command);
}