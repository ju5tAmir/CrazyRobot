namespace Application.Services;

public sealed class MqttOptions
{
    public string broker { get; set; } = "";
    public string host { get; set; } = "";
    public string Username { get; set; } = "";
    public string PublishEngineTopic { get; set; } = "";
    public string SubscribeEngineTopic { get; set; } = "";
    public string PublishCommandsTopic { get; set; } = "";
    public string SubscribeCommandsTopic { get; set; } = "";
    public string DistanceWarningTopic { get; set; } = "";

    public string NegativeDistanceWarningTopic { get; set; } = "";
    public string RobotOwner { get; set; } = "";
    public string BatteryLevelInfo { get; set; } = "";

}