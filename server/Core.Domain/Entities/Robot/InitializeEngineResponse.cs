namespace Core.Domain.Entities.Robot;

public class InitializeEngineResponse
{
    public bool InitializeEngine { get; set; }
    public String ErrorMessage { get; set; } = "";
}