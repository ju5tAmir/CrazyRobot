using Application.Models.Dtos.robot;
namespace Application.Interfaces.Robot;

public interface IBatteryNotifier
{
    void SendBatteryInfoToClient(BatteryPercentage batteryPercentage);
}