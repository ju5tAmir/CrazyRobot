using Api.Rest.Extensions;
using Api.Rest.Extensions.AuthExtension;
using Application.Interfaces.Security;
using Application.Models.Dtos.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Auth;

[ApiController]
public class AuthController(ISecurityService securityService) : ControllerBase
{
    public const string ControllerRoute = "api/auth/";
    public const string LoginRoute = ControllerRoute + nameof(Login);
    public const string RegisterRoute = ControllerRoute + nameof(RegisterAdmin);
    public const string RegisterUserRoute = ControllerRoute + nameof(RegisterUser);
    public const string SecuredRoute = ControllerRoute + nameof(Secured);


    [HttpPost]
    [Route(LoginRoute)]
    public ActionResult<AuthResponseDto> Login([FromBody] AuthRequestDto dto)
    {
        return Ok(securityService.Login(dto));
    }

    [Route(RegisterRoute)]
    [HttpPost]
    public ActionResult<AuthResponseDto> RegisterAdmin([FromBody] AuthRequestDto dto)
    {
        return Ok(securityService.RegisterAdmin(dto));
    }
    
    [Route(RegisterUserRoute)]
    [HttpPost]
    public ActionResult<AuthResponseDto> RegisterUser([FromBody] AuthUserRequest dto)
    {
        return Ok(securityService.RegisterUser(dto));
    }

    [HttpGet]
    [Route(SecuredRoute)]
    public ActionResult Secured()
    {
        securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
        return Ok("You are authorized to see this message");
    }
}