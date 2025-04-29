namespace Core.Domain.Entities.Robot;

public class Command<TPayload>
{
    public CommandType CommandType { get; set; }
    public TPayload Payload { get; set; }
}