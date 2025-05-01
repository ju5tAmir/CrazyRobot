using Api.Rest.ErrorHandling;
using Api.Rest.Extensions;
using Application.Interfaces.Api.Rest;
using Application.Interfaces.Security;
using Application.Models;
using Application.Models.Dtos.Surveys;
using Application.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Surveys;

[ApiController]
public class AdminSurveysController(ISecurityService securityService, IAdminSurveyService adminSurveyService, ILogger<AdminSurveysController> logger) : ControllerBase
{
    private const string ControllerRoute = "api/surveys/";
    private const string CreateRoute = ControllerRoute + nameof(CreateSurvey);
    private const string UpdateRoute = ControllerRoute + nameof(UpdateSurvey);
    private const string DeleteRoute = ControllerRoute + nameof(DeleteSurvey);
    private const string GetAllRoute = ControllerRoute + nameof(GetAllSurveys);
    private const string GetResultsRoute = ControllerRoute + nameof(GetSurveyResultById);
    private const string GetAllResultsRoute = ControllerRoute + nameof(GetSurveysResults);

        
    [HttpPost]
    [Route(CreateRoute)]
    /*
     To use Authorize, we need to adjust program.cs to UseAuthorization & UseAuthentication (and more stuff), but it doesn't work anyway?
    [Authorize(Roles = "admin")]
    */
    public async Task<ActionResult<SurveyResponseDto>> CreateSurvey(CreateSurveyRequestDto dto)
    {
        try
        {
            Console.WriteLine("JWT from header: " + HttpContext.GetJwt());
            var admin = securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
            Console.WriteLine("JWT Claims: " + admin.Email + " / " + admin.Role + " / " + admin.Exp);

            if (string.IsNullOrWhiteSpace(admin.Id) || !Roles.All.Any(role =>
                    string.Equals(role, admin.Role, StringComparison.OrdinalIgnoreCase)))
                return BadRequestErrorMessage(ErrorMessages.GetMessage(ErrorCode.InvalidRole));

            var result = await adminSurveyService.CreateSurvey(dto, admin.Id);
            return Ok(result);
        }
        catch (ApplicationException ex)
        {
            logger.Log(LogLevel.Warning, ex.Message, ex);
            return BadRequestErrorMessage(ex.Message);
        }
    }
    
    [HttpPut]
    [Route(UpdateRoute + "/{surveyId}")]
    public async Task<ActionResult<SurveyResponseDto>> UpdateSurvey(UpdateSurveyRequestDto dto)
    {
        try
        {
            var admin = securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
            if (string.IsNullOrWhiteSpace(admin.Id) || !Roles.All.Any(role =>
                    string.Equals(role, admin.Role, StringComparison.OrdinalIgnoreCase)))
                return BadRequestErrorMessage(ErrorMessages.GetMessage(ErrorCode.InvalidRole));

            var result = await adminSurveyService.UpdateSurvey(dto, admin.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Warning, ex.Message, ex);
            return BadRequestErrorMessage(ex.Message);
        }
    }
    
    [HttpDelete]
    [Route(DeleteRoute + "/{surveyId}")]
    public async Task<ActionResult> DeleteSurvey(string surveyId)
    {
        try
        {
            var admin = securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
            if (string.IsNullOrWhiteSpace(admin.Id) || !Roles.All.Any(role =>
                    string.Equals(role, admin.Role, StringComparison.OrdinalIgnoreCase)))
                return BadRequestErrorMessage(ErrorMessages.GetMessage(ErrorCode.InvalidRole));

            await adminSurveyService.DeleteSurvey(surveyId, admin.Id);
            return Ok();
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Warning, ex.Message, ex);
            return BadRequestErrorMessage(ex.Message);
        }
    }
    
    [HttpGet]
    [Route(GetAllRoute)]
    public async Task<ActionResult<SurveyResponseDto>> GetAllSurveys()
    {
        try
        {
            var surveys = await adminSurveyService.GetAllSurveys();
            return Ok(surveys);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Warning, ex.Message, ex);
            return BadRequestErrorMessage(ex.Message);
        }
    }
    
    [HttpGet]
    [Route(GetResultsRoute + "/{surveyId}")]
    public async Task<ActionResult<SurveyResultsDto>> GetSurveyResultById(string surveyId)
    {
        try
        {
            var admin = securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
            if (!Roles.All.Any(role => string.Equals(role, admin.Role, StringComparison.OrdinalIgnoreCase)))
                return BadRequestErrorMessage(ErrorMessages.GetMessage(ErrorCode.InvalidRole));

            var results = await adminSurveyService.GetSurveyResults(surveyId);
            return Ok(results);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Warning, ex.Message, ex);
            return BadRequestErrorMessage(ex.Message);
        }
    }
    
    [HttpGet]
    [Route(GetAllResultsRoute)]
    public async Task<ActionResult<List<SurveyResultsDto>>> GetSurveysResults()
    {
        try
        {
            var admin = securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
            if (!Roles.All.Any(role => string.Equals(role, admin.Role, StringComparison.OrdinalIgnoreCase)))
                return BadRequestErrorMessage(ErrorMessages.GetMessage(ErrorCode.InvalidRole));

            var results = await adminSurveyService.GetAllSurveysResults();
            return Ok(results);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Warning, ex.Message, ex);
            return BadRequestErrorMessage(ex.Message);
        }
    }
    
    private ActionResult BadRequestErrorMessage(string errorMessage)
    {
        ValidationErrors validation = new ValidationErrors
        {
            Message = new[] { errorMessage }
        };
        return BadRequest(new BadRequest(validation));
    }
}