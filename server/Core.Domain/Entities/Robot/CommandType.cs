using System.Runtime.Serialization;

namespace Core.Domain.Entities.Robot;

using System.Text.Json.Serialization;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CommandType
{
    [EnumMember(Value = "initialize")]
    Initialize,

    [EnumMember(Value = "move")]
    Move,

    [EnumMember(Value = "stop")]
    Stop
}
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ClientCommandType
{
    // [JsonPropertyName("initialized")]
    [EnumMember(Value = "initialized")]
    Initialized,
    // [JsonPropertyName("batteryStatus")]
    [EnumMember(Value = "batteryLevelInfo")]
    BatteryStatus,
    [EnumMember(Value ="distanceWarning")]
    DistanceWarning,
    [EnumMember(Value ="negativeWarning")]
    NegativeWarning
}

