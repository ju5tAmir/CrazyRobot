using Application.Interfaces.Infrastructure.mqtt;

namespace Infrastructure.Mqtt;

public class Publisher:IMqttPublisher
{
    private readonly MqttClientService _mqttClient;

    public Publisher(MqttClientService mqttClient)
    {
        _mqttClient = mqttClient;
    }

    public async Task Publish(string topic,object dto)
    { 
        await _mqttClient.PublishAsync(topic,dto);
        
    }
}