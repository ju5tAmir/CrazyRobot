using Application.Interfaces.Api.Websocket;
using Application.Interfaces.Security;
using Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class ServicesExtensions
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<IWebsocketSubscriptionService, WebsocketSubscriptionService>();
        return services;
    }
}