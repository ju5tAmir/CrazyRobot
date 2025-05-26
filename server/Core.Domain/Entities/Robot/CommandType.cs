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
    Stop,
    [EnumMember(Value = "Servo")]
    Servo
}
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ClientCommandType
{
    // [JsonPropertyName("initialized")]
    [EnumMember(Value = "initialized")]
    Initialized,
    // [JsonPropertyName("batteryStatus")]
    [EnumMember(Value = "batteryInfo")]
    BatteryInfo,
    [EnumMember(Value ="distanceWarning")]
    DistanceWarning,
    [EnumMember(Value ="negativeWarning")]
    NegativeWarning
}

