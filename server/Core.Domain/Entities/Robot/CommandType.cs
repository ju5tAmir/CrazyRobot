namespace Core.Domain.Entities.Robot;

using System.Text.Json.Serialization;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CommandType
{
    [JsonPropertyName("initialize")]
    Initialize,
    
    [JsonPropertyName("move")]
    Move,
    
    [JsonPropertyName("stop")]
    Stop
}
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ClientCommandType
{
    [JsonPropertyName("initialized")]
    Initialized,
    [JsonPropertyName("batteryStatus")]
    BatteryStatus
}
