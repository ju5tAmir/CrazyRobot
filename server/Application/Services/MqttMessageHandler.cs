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
    { Console.WriteLine("From handler");
        Console.WriteLine(payload);
        Console.WriteLine(topic);
        if (topic == "engineManagementEsp")
            Console.WriteLine("InTopic");
        {
            switch (payload.CommandType)
            {
                case  ClientCommandType.Initialized:
                    try
                    {
                        var initializePayload = payload.Payload.Deserialize<InitializeEngineResponse>();

                        if (initializePayload == null)
                        {
                            Console.WriteLine("Deserialization to InitializeEngineResponse returned null!");
                            throw new InvalidOperationException("Payload could not be deserialized into InitializeEngineResponse.");
                        }

                        var command = new ClientCommand<InitializeEngineResponse>
                        {
                            CommandType = payload.CommandType,
                            Payload = initializePayload,
                        };

                        Console.WriteLine("Successfully created command: " + JsonSerializer.Serialize(command));
                        await _initializeHandler.HandleCommand(topic, command);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error during deserialization or handling: " + ex.Message);
                    }

                    break;
                default:
                    throw new InvalidOperationException($"Unknown CommandType: {payload.CommandType}");
            }
        }
        
        await Task.CompletedTask;
    }
}