namespace Application.Interfaces.Infrastructure.mqtt;

public interface IMqttPublisher
{
  Task Publish( string topic,object dto);
}