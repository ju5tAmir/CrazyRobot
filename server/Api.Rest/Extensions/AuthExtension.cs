using System.Security.Authentication;

namespace Api.Rest.AuthExtensions;

public static class AuthExtension
{
    public static string GetJwt(this HttpContext ctx)
    {
        var header = ctx.Request.Headers["Authorization"].ToString();
        return header.StartsWith("Bearer ") ? header.Substring(7) : header;
    }
}