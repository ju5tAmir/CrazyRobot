using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Mqtt;

public class MqttHostedService : BackgroundService
{
    private readonly MqttClientService _mqttClientService;
    private readonly ILogger<MqttHostedService> _logger;

    public MqttHostedService(MqttClientService mqttClientService, ILogger<MqttHostedService> logger)
    {
        _mqttClientService = mqttClientService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Attempting to connect to MQTT broker...");
                await _mqttClientService.ConnectAsync();
                
                await _mqttClientService.SubscribeAsync("test");
                _logger.LogInformation("MQTT connected successfully.");

                // ✅ Connected: wait here forever or until stopped
                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to MQTT broker. Retrying in 5 seconds...");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); // wait and retry
            }
        }
    }
}