using Core.Domain.Entities.Robot;

namespace Application.Interfaces.Robot;

public interface IClientNegativeDistanceNotifier
{
    Task SendNegativeDistanceWarningToClient( string topic,NegativeDistanceWarning negativeDistanceWarning);
}