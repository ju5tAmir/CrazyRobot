using System.Security.Authentication;

namespace Api.Rest.Extensions;

public static class AuthExtension
{
    public static string GetJwt(this HttpContext ctx)
    {
        var header = ctx.Request.Headers["Authorization"].ToString();
        return header.StartsWith("Bearer ") ? header.Substring(7) : header;
        
        
        /*return ctx.Request.Headers.Authorization.FirstOrDefault() ??
               throw new AuthenticationException("No token provided");*/
    }
}