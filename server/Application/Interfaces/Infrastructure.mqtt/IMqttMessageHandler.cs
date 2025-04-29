

namespace Application.Interfaces.Infrastructure.mqtt;

public interface IMqttMessageHandler
{
   Task HandleAsync(string topic, ClientCommandDto payload);
}