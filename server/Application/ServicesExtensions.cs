using Application.Interfaces;
using Application.Interfaces.Api.Rest;
using Application.Interfaces.Api.Websocket;
using Application.Interfaces.Infrastructure.mqtt;
using Application.Interfaces.Robot;
using Application.Interfaces.Security;
using Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class ServicesExtensions
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
    {
        services.AddTransient<InitializeEngineHandler> ();
        services.AddSingleton<IMqttMessageHandler, MqttMessageHandler>();
        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<IAdminSurveyService, AdminSurveyService>();
        services.AddScoped<IUserSurveyService, UserSurveyService>();
        services.AddScoped<IWebsocketSubscriptionService, WebsocketSubscriptionService>();
        services.AddScoped<IContactService, ContactService>();
        services.AddScoped<IEventService,   EventService>();
        services.AddScoped<IRobotEngineService, RobotEngineService>();
        return services;
    }
}