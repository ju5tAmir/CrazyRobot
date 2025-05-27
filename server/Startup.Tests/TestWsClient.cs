using System;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Threading.Tasks;
using Websocket.Client;

namespace Startup.Tests
{
    public class TestWsClient : IAsyncDisposable
    {
        public TestWsClient()
        {
            var wsPort = Environment.GetEnvironmentVariable("PORT");
            if (string.IsNullOrEmpty(wsPort)) throw new Exception("Environment variable PORT is not set");
            WsClientId = Guid.NewGuid().ToString();
            var url = "ws://localhost:" + wsPort + "?id=" + WsClientId;
            var websocketUrl = new Uri(url);
            Console.WriteLine("Connecting to websocket at: " + websocketUrl);
            WsClient = new WebsocketClient(websocketUrl);

            WsClient.MessageReceived.Subscribe(msg => { ReceivedMessages.Enqueue(msg.Text); });
            WsClient.StartOrFail();
            Task.Delay(1000).GetAwaiter().GetResult();
        }

        public async Task DisconnectAsync()
        {
            try
            {
                await WsClient.Stop(WebSocketCloseStatus.NormalClosure, "Closing connection");
                WsClient.Dispose();
            }
            catch
            {
                // якщо щось піде не так — ігноруємо
            }
        }

        public async ValueTask DisposeAsync()
        {
            await DisconnectAsync();
            GC.SuppressFinalize(this);
        }

        public WebsocketClient WsClient { get; set; }
        public string WsClientId { get; set; }
        public ConcurrentQueue<string> ReceivedMessages { get; } = new();
    }
}