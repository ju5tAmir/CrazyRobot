using Application.Interfaces.Robot;
using Application.Models.Dtos.robot;
using Core.Domain.Entities.Robot;

namespace Application.Services.robot;

public class BatteryLevelHandler(IBatteryNotifier batteryNotifier):IMessageToClientHandler<BatteryLevel>
{
    private const double LowerValue  = 10.0;
    private const double FullPower = 12.6;
    private const double UsableVoltageWindow = FullPower - LowerValue;
    
    public  Task HandleCommand(string topic, ClientCommand<BatteryLevel> command)
    {
        Console.WriteLine("From the service of battery");
        var computedBatteryPercentage = ComputePercentage(command.Payload.BatteryLevelValue);
        batteryNotifier.SendBatteryInfoToClient(new BatteryPercentage(){BatteryPercentageLevel = computedBatteryPercentage});
        return Task.CompletedTask;
    }

    private int ComputePercentage(double currentVoltage)
    {
        var normalizedVoltage = currentVoltage - LowerValue;
        var percentage = (int)((normalizedVoltage * 100) / UsableVoltageWindow);
        return Math.Clamp(percentage, 0, 100);
    }
}