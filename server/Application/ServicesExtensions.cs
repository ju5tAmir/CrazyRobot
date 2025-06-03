using Application.Interfaces;
using Application.Interfaces.Api.Rest;
using Application.Interfaces.Api.Websocket;
using Application.Interfaces.Infrastructure.mqtt;
using Application.Interfaces.Robot;
using Application.Interfaces.Security;
using Application.Interfaces.timer;
using Application.Models;
using Application.Services;
using Application.Services.robot;
using Application.Services.robot.servos;
using Application.Services.Timer;
using Core.Domain.Entities.Robot;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class ServicesExtensions
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
    {
        services.AddTransient<IMessageToClientHandler<InitializeEngineResponse>,InitializeEngineHandler> ();
        services.AddTransient<IMessageToClientHandler<NegativeDistanceWarning>,NegativeDistanceHandler>();
        services.AddTransient<IMessageToClientHandler<DistanceWarning>,DistanceWarningHandler>();
        services.AddTransient<IMessageToClientHandler<BatteryLevel>,BatteryLevelHandler>();
        services.AddSingleton<IMqttMessageHandler, MqttMessageHandler>();
        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<IAdminSurveyService, AdminSurveyService>();
        services.AddScoped<IUserSurveyService, UserSurveyService>();
        services.AddScoped<IWebsocketSubscriptionService, WebsocketSubscriptionService>();
        services.AddScoped<IContactService, ContactService>();
        services.AddScoped<IEventService,   EventService>();
        services.AddScoped<IReportService,ReportService>();
        services.AddScoped<IRobotEngineService, RobotEngineService>();
        services.AddScoped<IClientTimerService,ClientWatchdogService>();
        services.AddScoped<IServoService, ServoManagerService>();
        return services;
    }
}