using System.Text.Json;
using Application.Interfaces.Infrastructure.mqtt;
using Core.Domain.Entities.Robot;

namespace Application.Services;

public class MqttMessageHandler:IMqttMessageHandler
{
    private InitializeEngineHandler _initializeHandler;


    public MqttMessageHandler(InitializeEngineHandler initializeHandler)
    {
      _initializeHandler = initializeHandler;
    }

    public async Task HandleAsync(string topic, ClientCommandDto payload)
    {
        Console.WriteLine(payload);
        Console.WriteLine(topic);
        if (topic == "engineManagementEsp")
        {
            switch (payload.CommandType)
            {
                case  ClientCommandType.Initialized:
                    var initializePayload = payload.Payload.Deserialize<InitializeEngineResponse>();
                    var command = new ClientCommand<InitializeEngineResponse>
                    {
                        CommandType = payload.CommandType,
                        Payload = initializePayload!
                    };

                    await _initializeHandler.HandleCommand(topic,command);
                    break;
                default:
                    throw new InvalidOperationException($"Unknown CommandType: {payload.CommandType}");
            }
        }


        await Task.CompletedTask;

    }
}