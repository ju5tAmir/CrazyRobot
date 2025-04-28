using Application.Interfaces.Infrastructure.mqtt;
using Application.Interfaces.Robot;
using Microsoft.Extensions.Options;

namespace Application.Services;

public class RobotEngineService(IMqttPublisher mqttPublisher,IOptionsMonitor<MqttOptions> mqttOptionsMonitor):IRobotEngineService
{
    public async Task ManageEngine(bool engineState)
    {
      await   mqttPublisher.Publish(engineState, mqttOptionsMonitor.CurrentValue.PublishEngineTopic);
    }
}