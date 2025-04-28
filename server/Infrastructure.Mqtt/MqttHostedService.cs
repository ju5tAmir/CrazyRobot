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
                var connected = await _mqttClientService.ConnectAsync();  // now returns bool

                if (connected)
                {
                    _logger.LogInformation("MQTT connected successfully.");
                    await Task.Delay(Timeout.Infinite, stoppingToken); // wait forever
                }
                else
                {
                    _logger.LogWarning("Failed to connect. Retrying in 5 seconds...");
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while trying to connect. Retrying...");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

}