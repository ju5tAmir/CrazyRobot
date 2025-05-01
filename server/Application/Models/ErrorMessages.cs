using Application.Models.Enums;

namespace Application.Models;

public static class ErrorMessages
{
    private static readonly Dictionary<ErrorCode, string> _errorMessages = new()
    {
        { ErrorCode.ErrorUserId, "Id is required" },
        { ErrorCode.InvalidUserEmail, "Invalid user email" },
        { ErrorCode.UnexpectedError, "An unexpected error occured, please try again" },
        { ErrorCode.InvalidRole, "Invalid role" },
        
    };
    
    public static string GetMessage(ErrorCode errorCode)
    {
        return _errorMessages.GetValueOrDefault(errorCode, "This error is undefined");
    }
}