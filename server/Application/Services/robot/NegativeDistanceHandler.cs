using Application.Interfaces.Robot;
using Core.Domain.Entities.Robot;

namespace Application.Services.robot;

public class NegativeDistanceHandler(IClientNegativeDistanceNotifier negativeNotifier):IMessageToClientHandler<NegativeDistanceWarning>
{
    public async Task HandleCommand(string topic, ClientCommand<NegativeDistanceWarning> command)
    
    {
        await negativeNotifier.SendNegativeDistanceWarningToClient(topic,command.Payload);
    }
    
}
