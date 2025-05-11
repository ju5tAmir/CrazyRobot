using System.Text.Json;
using Application.Interfaces.Infrastructure.mqtt;
using Application.Services.robot;
using Core.Domain.Entities.Robot;

namespace Application.Services;

public class MqttMessageHandler:IMqttMessageHandler
{
    private InitializeEngineHandler _initializeHandler;
    private DistanceWarningHandler _distanceWarningHandler;
    private NegativeDistanceHandler _negativeDistanceHandler;


    public MqttMessageHandler(InitializeEngineHandler initializeHandler,DistanceWarningHandler distanceWarningHandler,NegativeDistanceHandler negativeDistanceHandler)
    {
      _initializeHandler = initializeHandler;
      _distanceWarningHandler = distanceWarningHandler;
      _negativeDistanceHandler = negativeDistanceHandler;
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
                
                case ClientCommandType.DistanceWarning:
                    try
                    {
                        var distanceWarning = payload.Payload.Deserialize<DistanceWarning>();

                        if (distanceWarning == null)
                        {
                            Console.WriteLine("Deserialization to  DistanceWarning  returned null!");
                            throw new InvalidOperationException("Payload could not be deserialized into InitializeEngineResponse.");
                        }

                        var command = new ClientCommand<DistanceWarning>
                        {
                            CommandType = payload.CommandType,
                            Payload = distanceWarning,
                        };

                        Console.WriteLine("Successfully created command: " + JsonSerializer.Serialize(command));
                        try
                        {
                            await _distanceWarningHandler.HandleCommand(topic, command);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Error in HandleCommand: " + ex.Message);
                            Console.WriteLine("StackTrace: " + ex.StackTrace);
                        }

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error during deserialization or handling: " + ex.Message);
                    }

                    break;
                
                case ClientCommandType.NegativeWarning:
                    try
                    {
                        var distanceWarning = payload.Payload.Deserialize<NegativeDistanceWarning>();

                        if (distanceWarning == null)
                        {
                            Console.WriteLine("Deserialization to  DistanceWarning  returned null!");
                            throw new InvalidOperationException("Payload could not be deserialized into InitializeEngineResponse.");
                        }

                        var command = new ClientCommand<NegativeDistanceWarning>
                        {
                            CommandType = payload.CommandType,
                            Payload = distanceWarning,
                        };

                        Console.WriteLine("Successfully created command: " + JsonSerializer.Serialize(command));
                        await _negativeDistanceHandler.HandleCommand(topic, command);
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