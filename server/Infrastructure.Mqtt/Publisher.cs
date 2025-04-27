using Application.Interfaces.Infrastructure.mqtt;

namespace Infrastructure.Mqtt;

public class Publisher:IMqttPublisher
{
    private readonly MqttClientService _mqttClient;

    public Publisher(MqttClientService mqttClient)
    {
        _mqttClient = mqttClient;
    }

    public async Task Publish(object dto, string topic)
    { 
        await _mqttClient.PublishAsync(topic,dto);
        
    }
}