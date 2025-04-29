using System.Text.Json.Serialization;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Direction
{
    [JsonPropertyName("forward")]
    Forward,
    
    [JsonPropertyName("backward")]
    Backward,
    
    [JsonPropertyName("left")]
    Left,
    
    [JsonPropertyName("right")]
    Right
}