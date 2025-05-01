using Application.Interfaces.Robot;
using Core.Domain.Entities.Robot;

namespace Application.Services;

public class InitializeEngineHandler(IClientNotifier clientNotifier) 
{
    public async Task HandleCommand(string topic, ClientCommand<InitializeEngineResponse> command)
    
    {
        Console.WriteLine(command + "from engine handler");
        await clientNotifier.SendEngineStatusToClient(command.Payload.InitializeEngine);
    }
}