using System.Collections.Concurrent;
using Application.Models;

namespace Application.Interfaces.Infrastructure.Websocket;

public interface IConnectionManager
{
    public ConcurrentDictionary<string, object> GetConnectionIdToSocketDictionary();
    public ConcurrentDictionary<string, string> GetSocketIdToClientIdDictionary();

    Task OnOpen(object socket, string clientId);
    Task OnClose(object socket, string clientId);
    Task AddToTopic(string topic, string memberId);
    Task RemoveFromTopic(string topic, string memberId);
    Task BroadcastToTopic<TMessage>(string topic, TMessage message) where TMessage : class;
    Task<List<string>> GetMembersFromTopicId(string topic);
    Task<List<string>> GetTopicsFromMemberId(string memberId);
    public string GetClientIdFromSocket(object socket);
    public object GetSocketFromClientId(string clientId);
    Task SubscribeToDefaultTopics(string clientId);
    Task RemoveFromDefaultTopics(string clientId);
    void AddTimerToConnection(string clientId, ClientWatchdogState timerClientWatchdogState);
    bool RemoveTimerToConnection(string clientId, out ClientWatchdogState timer);
    Task<ClientWatchdogState?> GetTimerForConnection(string clientId);
    Task RemoveAndCloseConnection(string clientId);
}