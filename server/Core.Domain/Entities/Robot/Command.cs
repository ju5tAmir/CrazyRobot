namespace Core.Domain.Entities.Robot;
/// <summary>
/// Represents a command sent from the  client  to the microcontroller, encapsulating both the type of command and its associated payload.
/// </summary>
/// <typeparam name="TPayload">The type of the data payload associated with the command.</typeparam>
public class Command<TPayload>
{
    public CommandType CommandType { get; set; }
    public TPayload Payload { get; set; }
}