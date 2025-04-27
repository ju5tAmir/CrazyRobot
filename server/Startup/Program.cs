using System.Text.Json;
using Api.Rest;

using Api.Websocket;
using Application;
using Infrastructure.Mqtt;
using Infrastructure.Postgres;
using Infrastructure.Websocket;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NSwag.Generation;
using Startup.Documentation;
using Startup.Proxy;
using Scalar.AspNetCore;
 


namespace Startup;

public class Program
{
    public static async Task Main()
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddLogging(logging =>
        {
            logging.ClearProviders();
            logging.AddConsole();  // <-- This writes logs to the console
            logging.AddDebug();    // <-- Useful if you use Visual Studio Debug Output
        });
        ConfigureServices(builder.Services, builder.Configuration);
        var app = builder.Build();
        await ConfigureMiddleware(app);
        await app.RunAsync();
    }

    public static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        var appOptions = services.AddAppOptions(configuration);
      
        services.RegisterApplicationServices();
          
        services.AddDataSourceAndRepositories();
       
        services.AddWebsocketInfrastructure();
        services.AddMqttClient();
        services.RegisterWebsocketApiServices();
        services.RegisterRestApiServices();
        services.AddOpenApiDocument(conf =>
        {
            conf.DocumentProcessors.Add(new AddAllDerivedTypesProcessor());
            conf.DocumentProcessors.Add(new AddStringConstantsProcessor());
        });
        services.AddSingleton<IProxyConfig, ProxyConfig>();
    }

    public static async Task ConfigureMiddleware(WebApplication app)
    {
        var logger = app.Services.GetRequiredService<ILogger<IOptionsMonitor<AppOptions>>>();
        var appOptions = app.Services.GetRequiredService<IOptionsMonitor<AppOptions>>().CurrentValue;
        logger.LogInformation(JsonSerializer.Serialize(appOptions));
        using (var scope = app.Services.CreateScope())
        {
            if (appOptions.Seed)
                await scope.ServiceProvider.GetRequiredService<Seeder>().Seed();
        }

        app.Urls.Clear();
        app.Urls.Add($"http://0.0.0.0:{appOptions.REST_PORT}");
        app.Services.GetRequiredService<IProxyConfig>()
            .StartProxyServer(appOptions.PORT, appOptions.REST_PORT, appOptions.WS_PORT);

        app.ConfigureRestApi();
        await app.ConfigureWebsocketApi(appOptions.WS_PORT);
        
        app.MapGet("Acceptance", () => "Accepted");
               app.UseOpenApi(conf => { conf.Path = "openapi/v1.json"; });
                app.UseSwaggerUi(ui =>
                {
                    ui.Path         = "/swagger";          // сторінка UI
                    ui.DocumentPath = "/openapi/v1.json";  // звідки брати JSON
                });
 
        var document = await app.Services.GetRequiredService<IOpenApiDocumentGenerator>().GenerateAsync("v1");
        var json = document.ToJson();
        await File.WriteAllTextAsync("openapi.json", json);
        app.GenerateTypeScriptClient("/../../control-panel-ui/src/api/generated-socketclient.ts").GetAwaiter().GetResult();
        app.MapScalarApiReference();
    }
}