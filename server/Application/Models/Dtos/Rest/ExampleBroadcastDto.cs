namespace Application.Models.Dtos.Rest;

public class ExampleBroadcastDto
{
    public string eventType { get; set; } = nameof(ExampleBroadcastDto);
    public string Message { get; set; }
}