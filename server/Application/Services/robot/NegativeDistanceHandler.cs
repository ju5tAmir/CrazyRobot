using Application.Interfaces.Robot;
using Core.Domain.Entities.Robot;

namespace Application.Services.robot;

public class NegativeDistanceHandler(IClientNegativeDistanceNotifier negativeNotifier)
{
    public async Task HandleCommand(string topic, ClientCommand<NegativeDistanceWarning> command)
    
    {
        Console.WriteLine(command.Payload.Warning + "from engine handler");
        await negativeNotifier.SendNegativeDistanceWarningToClient(topic,command.Payload);
    }
    
}
