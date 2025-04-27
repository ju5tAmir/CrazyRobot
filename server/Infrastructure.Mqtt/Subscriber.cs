

using Application.Interfaces.Infrastructure.mqtt;
using Infrastructure.Mqtt;

public  class Subscriber :IMqttSubscriber
{
    private readonly MqttClientService _mqttClient;

    public Subscriber(MqttClientService mqttClient)
    {
        _mqttClient = mqttClient;
    }

    public  async Task Subscribe(string topic, int qualityOfService)
    {
        await _mqttClient.SubscribeAsync(topic);
    }
}