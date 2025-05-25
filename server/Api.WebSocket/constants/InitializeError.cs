public enum InitErrorCode
{
    Battery,
    Lidar
}

public static class InitErrorInfo
{
    private static readonly Dictionary<string, InitErrorCode> StringToEnum = new(StringComparer.OrdinalIgnoreCase)
    {
        { "BATTERY", InitErrorCode.Battery },
        { "LIDAR", InitErrorCode.Lidar }
    };

    private static readonly Dictionary<InitErrorCode, string> EnumToApiCode = new()
    {
        { InitErrorCode.Battery, "BATTERY" },
        { InitErrorCode.Lidar, "LIDAR" }
    };

    private static readonly Dictionary<InitErrorCode, string> ErrorMessages = new()
    {
        { InitErrorCode.Battery, "Initializing robot failed! Battery level too low!" },
        { InitErrorCode.Lidar, "Initializing lidar failed! Distance warning and sensing will not work." }
    };

    public static bool TryParse(string input, out InitErrorCode code)
    {
        return StringToEnum.TryGetValue(input, out code);
    }

    public static string GetApiCode(InitErrorCode code)
    {
        return EnumToApiCode.TryGetValue(code, out var value) ? value : "UNKNOWN";
    }

    public static string GetMessage(InitErrorCode code)
    {
        return ErrorMessages.TryGetValue(code, out var message) ? message : "An unknown error occurred.";
    }
}