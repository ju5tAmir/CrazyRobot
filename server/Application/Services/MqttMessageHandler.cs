using Application.Interfaces.Infrastructure.mqtt;

namespace Application.Services;

public class MqttMessageHandler:IMqttMessageHandler
{
    public async Task HandleAsync(string topic, object payload)
    {
        
        Console.WriteLine(payload);
        await Task.CompletedTask;

    }
}