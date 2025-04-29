
using Application.Interfaces.Robot;
using Core.Domain.Entities.Robot;

public class InitializeEngineHandler(IClientNotifier clientNotifier) 
{
    public async Task HandleCommand(string topic, ClientCommand<InitializeEngineResponse> command)
    {
       await  clientNotifier.SendEngineStatusToClient(command.Payload.InitializeEngine);
    }
}