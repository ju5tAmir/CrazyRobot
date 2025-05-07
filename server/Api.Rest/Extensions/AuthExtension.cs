using System.Security.Authentication;

namespace Api.Rest.Extensions.AuthExtension;          

public static class AuthExtension
{
    public static string GetJwt(this HttpContext ctx)
    {
        var header = ctx.Request.Headers["Authorization"].ToString();
        return header.StartsWith("Bearer ") ? header.Substring(7) : header;
        
        // I changed this because I was having errors when validating the JWT token. Nelson
        
        /*return ctx.Request.Headers.Authorization.FirstOrDefault() ??
               throw new AuthenticationException("No token provided");*/
    }
}