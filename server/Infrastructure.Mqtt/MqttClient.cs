using MQTTnet;
using MQTTnet.Protocol;
using System.Text;
using System.Text.Json;
using Application.Interfaces.Infrastructure.mqtt;
using Application.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Mqtt;

public class MqttClientService
{
    private readonly IMqttClient _client;
    private readonly IOptionsMonitor<MqttOptions> _mqttOptions;
    private readonly ILogger<MqttClientService> _logger;
    private readonly IMqttMessageHandler _messageHandler;
    private int _reconnectAttempts = 0;
    private const int MaxReconnectAttempts = 5;

    
    public MqttClientService(IOptionsMonitor<MqttOptions> mqttOptions, ILogger<MqttClientService> logger,
        IMqttMessageHandler messageHandler)
    {
        _mqttOptions = mqttOptions;
        _logger = logger;
        _messageHandler = messageHandler;
        var factory = new MqttClientFactory();
        _client = factory.CreateMqttClient();
_client.DisconnectedAsync += async e =>
{
    _logger.LogWarning("MQTT client disconnected. Reason: " + e.Reason);

    if (_reconnectAttempts >= MaxReconnectAttempts)
    {
        _logger.LogError("Maximum reconnect attempts reached. Giving up.");
        return;
    }

    _reconnectAttempts++;
    await Task.Delay(TimeSpan.FromSeconds(5 * _reconnectAttempts)); 

    try
    {
        if (await ConnectAsync())
        {
            _reconnectAttempts = 0; // reset on success
        }
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Reconnection attempt failed.");
    }

        };
    }
    
    public async Task<bool> ConnectAsync()
    {
        Console.WriteLine(_mqttOptions.CurrentValue.broker + " Trying to connect...");
        Console.WriteLine(_mqttOptions.CurrentValue.Username + " Trying to connect... username");

        try
        {
            var brokerUri = _mqttOptions.CurrentValue.broker;
            var options = new MqttClientOptionsBuilder()
                .WithWebSocketServer(o => o.WithUri(brokerUri))
                .WithKeepAlivePeriod(TimeSpan.FromSeconds(15))
                .WithCredentials("FlespiToken " + _mqttOptions.CurrentValue.Username, "")
                .WithClientId(Guid.NewGuid().ToString())
                .WithCleanSession()
                .Build();

            var result = await _client.ConnectAsync(options);
            _client.ApplicationMessageReceivedAsync += HandleIncomingMessageAsync;

            if (result.ResultCode == MqttClientConnectResultCode.Success)
            {
                _logger.LogInformation("Connected successfully to MQTT broker.");
                await SubscribeAsync(_mqttOptions.CurrentValue.SubscribeEngineTopic);
                await SubscribeAsync(_mqttOptions.CurrentValue.SubscribeCommandsTopic); 
                await SubscribeAsync(_mqttOptions.CurrentValue.DistanceWarningTopic);
                await SubscribeAsync(_mqttOptions.CurrentValue.NegativeDistanceWarningTopic);
                await SubscribeAsync(_mqttOptions.CurrentValue.BatteryLevelInfo);
                return true;
            }
            else
            {
                _logger.LogError($"Failed to connect to MQTT broker. ResultCode: {result.ResultCode}");
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while connecting to MQTT broker.");
            return false;
        }
    }


    public async Task SubscribeAsync(string topic)
    {
        await _client.SubscribeAsync(new MqttTopicFilterBuilder()
            .WithTopic(topic)
            .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.AtLeastOnce)
            .Build());

        _logger.LogInformation($"Subscribed to topic: {topic}");
    }


    //TODO extract the proper message from the mqtt 
    /// <summary>
    /// For example when the esp32 sends commands back , that will tell the client that is initialized will send this message
    /// {
    /// CommandType : "Initialized"
    /// Payload : Object
    /// {
    ///  InitializeEngine:true
    /// }
    ///} 
    /// </summary>
    private async Task HandleIncomingMessageAsync(MqttApplicationMessageReceivedEventArgs e)
    {
        var topic = e.ApplicationMessage.Topic;
        var payloadString = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
        Console.WriteLine(payloadString);
        Console.WriteLine(topic);
        Console.WriteLine("I am executed");
        ClientCommandDto? command = null;

        try
        {
            command = JsonSerializer.Deserialize<ClientCommandDto>(payloadString);
            if (command == null)
            {
                Console.WriteLine("Deserialization returned null.");
            }
            else
            {
                Console.WriteLine("Deserialized successfully. CommandType: " + command.CommandType);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Deserialization error: " + ex.Message);
        }
        
        if (command == null)
        {
            throw new InvalidOperationException("Failed to deserialize ClientCommand.");
        }
        
        await _messageHandler.HandleAsync(topic, command);
    }

    public async Task PublishAsync(string topic, object message)
    {
        var payload = JsonSerializer.Serialize(message);
        var mqttMessage = new MqttApplicationMessageBuilder()
            .WithTopic(topic)
            .WithPayload(payload)
            .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.AtLeastOnce)
            .Build();

        await _client.PublishAsync(mqttMessage);

        _logger.LogInformation($"Published message to topic: {topic}");
    }

    public async Task DisconnectAsync()
    {
        await _client.DisconnectAsync();
        _logger.LogInformation("Disconnected from MQTT broker.");
    }
}