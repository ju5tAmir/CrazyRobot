namespace Application.Interfaces.Infrastructure.mqtt;

public interface IMqttSubscriber
{
    Task Subscribe(string topic, int qualityOfService);
}