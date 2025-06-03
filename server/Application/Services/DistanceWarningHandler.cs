using Application.Interfaces.Robot;
using Core.Domain.Entities.Robot;

namespace Application.Services;

public class DistanceWarningHandler(IClientMovementNotifier clientNotifier):IMessageToClientHandler<DistanceWarning>
{
    public async Task HandleCommand(string topic, ClientCommand<DistanceWarning> command)
    {
        await clientNotifier.SendDistanceWarningToClient(command.Payload);
    } 
}