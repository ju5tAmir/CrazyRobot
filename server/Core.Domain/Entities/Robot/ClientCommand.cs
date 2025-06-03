namespace Core.Domain.Entities.Robot;
/// <summary>
/// Represents a command sent from the  microcontroller to be displayed by the client, encapsulating both the type of command and its associated payload.
/// </summary>
/// <typeparam name="TPayload">The type of the data payload associated with the command.</typeparam>
public class ClientCommand<TPayload>
{
    /// <summary>
    /// The type of command sent by the client, used to identify the action to be performed.
    /// </summary>
    public ClientCommandType CommandType { get; set; }
    /// <summary>
    /// The payload data associated with the command. Its structure depends on the command type.
    /// </summary>
    public TPayload Payload { get; set; }
}

