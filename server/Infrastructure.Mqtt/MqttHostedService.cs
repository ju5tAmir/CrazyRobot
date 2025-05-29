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

// protected override async Task ExecuteAsync(CancellationToken stoppingToken)
// {
//     while (!stoppingToken.IsCancellationRequested)
//     {
//         try
//         {
//             _logger.LogInformation("Attempting to connect to MQTT broker...");
//             var connected = await _mqttClientService.ConnectAsync();
//
//             if (connected)
//             {
//                 _logger.LogInformation("MQTT connected successfully.");
//                 try
//                 {
//                     await Task.Delay(Timeout.Infinite, stoppingToken);
//                 }
//                 catch (TaskCanceledException)
//                 {
//                     // Expected during shutdown, no need to log as error
//                     _logger.LogInformation("MQTT Hosted Service is stopping...");
//                 }
//             }
//             else
//             {
//                 _logger.LogWarning("Failed to connect. Retrying in 5 seconds...");
//                 await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
//             }
//         }
//         catch (TaskCanceledException)
//         {
//             // This can happen if stoppingToken is cancelled during delay or ConnectAsync
//             _logger.LogInformation("MQTT Hosted Service is stopping...");
//             break;  // exit the while loop
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Exception while trying to connect. Retrying...");
//             await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
//         }
//     }
// }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Attempting to connect to MQTT broker...");
                var connected = await _mqttClientService.ConnectAsync();

                if (connected)
                {
                    _logger.LogInformation("MQTT connected successfully.");
                    try
                    {
                        await Task.Delay(Timeout.Infinite, stoppingToken);
                    }
                    catch (TaskCanceledException)
                    {
                        _logger.LogInformation("MQTT Hosted Service is stopping...");
                    }
                }
                else
                {
                    _logger.LogWarning("Initial connect failed. Starting reconnect logic...");
                    await _mqttClientService.AttemptReconnectAsync();
                }
            }
            catch (TaskCanceledException)
            {
                _logger.LogInformation("MQTT Hosted Service is stopping...");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while trying to connect.");
                await _mqttClientService.AttemptReconnectAsync();
            }
        }
    }

}
