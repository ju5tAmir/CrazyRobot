using System;
using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Application.Services;
using Microsoft.Extensions.Options;
using MQTTnet;
 
using MQTTnet.Protocol;

namespace Startup.Tests
{
    public class TestMqttClient
    {
        private readonly IMqttClient _client;

        public string DeviceId { get; } = Guid.NewGuid().ToString();
        public ConcurrentQueue<string> ReceivedMessages { get; } = new();

        public TestMqttClient(IOptionsMonitor<MqttOptions> mqttOptionsMonitor)
        {
            var mqttOpts = mqttOptionsMonitor.CurrentValue;
            var options = new MqttClientOptionsBuilder()
                .WithWebSocketServer(o => o.WithUri(mqttOpts.broker))
                .WithKeepAlivePeriod(TimeSpan.FromSeconds(15))
                .WithClientId($"testClient_{Guid.NewGuid()}")
                .WithCredentials("FlespiToken " + mqttOpts.Username, "")
                .WithCleanSession()
                .Build();

            var factory = new MqttClientFactory();
            _client = factory.CreateMqttClient();

            _client.ApplicationMessageReceivedAsync += HandleReceivedMessageAsync;
            _client.ConnectAsync(options).GetAwaiter().GetResult();
        }

        private Task HandleReceivedMessageAsync(MqttApplicationMessageReceivedEventArgs args)
        {
            try
            {
                var payloadString = Encoding.UTF8.GetString(args.ApplicationMessage.Payload);
                var jsonElement = JsonSerializer.Deserialize<JsonElement>(payloadString);
                var stringRepresentation = JsonSerializer.Serialize(jsonElement, new JsonSerializerOptions
                {
                    WriteIndented = true
                });
                ReceivedMessages.Enqueue(stringRepresentation);
            }
            catch
            {
                var payloadString = Encoding.UTF8.GetString(args.ApplicationMessage.Payload);
                ReceivedMessages.Enqueue(payloadString);
            }
            return Task.CompletedTask;
        }

        public Task SubscribeAsync(string topic, MqttQualityOfServiceLevel qos = MqttQualityOfServiceLevel.AtLeastOnce)
        {
            return _client.SubscribeAsync(new MqttTopicFilterBuilder()
                .WithTopic(topic)
                .WithQualityOfServiceLevel(qos)
                .Build());
        }

        public Task DisconnectAsync() => _client.DisconnectAsync();
    }
}