using Application.Interfaces.Infrastructure.mqtt;
using Application.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;


namespace Infrastructure.Mqtt;

public  static class InfrastructureMqttExtension
{ 
    public static IServiceCollection AddMqttClient(this IServiceCollection services)
    {  
        services.AddOptions<MqttOptions>()
            .BindConfiguration("Mqtt").ValidateDataAnnotations();
       
        services.AddSingleton<MqttClientService>(sp =>
        {
            var options = sp.GetRequiredService<IOptionsMonitor<MqttOptions>>();
            var logger = sp.GetRequiredService<ILogger<MqttClientService>>();
            var handler = sp.GetRequiredService<IMqttMessageHandler>();
            var mqttClientService = new MqttClientService(options, logger,handler);
            return mqttClientService;
        });
        services.AddHostedService<MqttHostedService>();
       services.AddScoped<IMqttPublisher,Publisher>();
       services.AddScoped<IMqttSubscriber,Subscriber>();
        return services;
    }
    
}