using Application.Models.Dtos.robot;
using Core.Domain.Entities.Robot;

namespace Application.Interfaces.Robot;

public interface IBatteryNotifier
{
    Task SendBatteryInfoToClient(BatteryPercentage batteryPercentage);
}