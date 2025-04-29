namespace Core.Domain.Entities.Robot;

public class ClientCommand<TPayload>
{
    public ClientCommandType CommandType { get; set; }
    public TPayload Payload { get; set; }
}