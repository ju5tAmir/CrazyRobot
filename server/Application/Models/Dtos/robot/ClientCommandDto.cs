using System.Text.Json;
using System.Text.Json.Serialization;
using Core.Domain.Entities.Robot;

public class ClientCommandDto
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ClientCommandType CommandType { get; set; }
    public JsonElement Payload { get; set; }
}