using Application.Interfaces.Infrastructure.mqtt;
using Application.Interfaces.Robot;
using Core.Domain.Entities.Robot;
using Microsoft.Extensions.Options;

namespace Application.Services.robot.servos;

public class ServoManagerService (IMqttPublisher mqttPublisher,IOptionsMonitor<MqttOptions> optionsMonitor):IServoService
{
    public async Task ManageServos(Command<ServoCommand> command)
    {
        Console.WriteLine(command.Payload);
        Console.WriteLine("In Servo Publis");
        await mqttPublisher.Publish(optionsMonitor.CurrentValue.ServoCommandTopic,command);
    }
}