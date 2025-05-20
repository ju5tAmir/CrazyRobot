
namespace Application.Models;

public class ClientWatchdogState
{
    public Timer ActiveTimer { get; set; }
    public CancellationTokenSource ConfirmationTimeoutCts { get; set; }
    public Func<string, Task>? OnTimeout { get; set; }
}