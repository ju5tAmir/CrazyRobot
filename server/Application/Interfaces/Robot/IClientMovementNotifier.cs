﻿using Core.Domain.Entities.Robot;

namespace Application.Interfaces.Robot;

public interface IClientMovementNotifier
{
    Task SendDistanceWarningToClient(DistanceWarning distancewarning);
}