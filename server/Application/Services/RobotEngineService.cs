using Application.Interfaces.Infrastructure.mqtt;
using Application.Interfaces.Robot;
using Core.Domain.Entities.Robot;
using Microsoft.Extensions.Options;

namespace Application.Services;

public class RobotEngineService(IMqttPublisher mqttPublisher,IOptionsMonitor<MqttOptions> mqttOptionsMonitor):IRobotEngineService
{
    public async Task ManageEngine(Command<EngineManagement> command)
    {
      await   mqttPublisher.Publish(mqttOptionsMonitor.CurrentValue.PublishEngineTopic,command);
    }

    public async Task ManageMovement(Command<MovementCommand> command)
    {
        await mqttPublisher.Publish(mqttOptionsMonitor.CurrentValue.PublishCommandsTopic,command);
     Console.WriteLine(command.CommandType);
     foreach (var VA in command.Payload.Directions.ActiveMovements)
     {
         Console.Write(VA+", ");         
     }
     Console.WriteLine(command.Payload.Directions);
    } 
}