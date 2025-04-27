namespace Application.Interfaces.Infrastructure.mqtt;

public interface IMqttPublisher
{
  Task Publish(object dto, string topic);
}