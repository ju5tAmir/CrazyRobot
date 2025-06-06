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
    public const string RegisterUserRoute = ControllerRoute + nameof(LoginOrRegisterUser);
    public const string SecuredRoute = ControllerRoute + nameof(Secured);


    [HttpPost]
    [Route(LoginRoute)]
    public ActionResult<AuthResponseDto> Login([FromBody] AuthRequestDto dto)
    {
        return Ok(securityService.LoginAdmin(dto));
    }

    [HttpPost]
    [Route(RegisterRoute)]
    public async Task<ActionResult<AuthResponseDto>> RegisterAdmin([FromBody] AuthRequestDto dto)
    {
        var response = await securityService.RegisterAdmin(dto);
        return Ok(response);
    }
    
    [Route(RegisterUserRoute)]
    [HttpPost]
    public ActionResult<AuthResponseDto> LoginOrRegisterUser([FromBody] AuthUserRequest dto)
    {
        return Ok(securityService.LoginOrRegisterUser(dto));
    }

    [HttpGet]
    [Route(SecuredRoute)]
    public ActionResult Secured()
    {
        securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
        return Ok("You are authorized to see this message");
    }
}