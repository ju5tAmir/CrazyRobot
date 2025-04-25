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
public class SurveysController(ISecurityService securityService, ISurveyService surveyService, ILogger<SurveysController> logger) : ControllerBase
{
    private const string ControllerRoute = "api/surveys/";
    private const string CreateRoute = ControllerRoute + nameof(CreateSurvey);
    private const string UpdateRoute = ControllerRoute + nameof(UpdateSurvey);
    private const string DeleteRoute = ControllerRoute + nameof(DeleteSurvey);
    private const string GetAllRoute = ControllerRoute + nameof(GetAllSurveys);
    private const string SubmitRoute = ControllerRoute + nameof(SubmitResponse);
    private const string GetResultsRoute = ControllerRoute + nameof(GetSurveysResults);

        
    [HttpPost]
    [Route(CreateRoute)]
    /*
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

            var result = await surveyService.CreateSurvey(dto, admin.Id);
            return Ok(result);
        }
        catch (ApplicationException ex)
        {
            logger.Log(LogLevel.Warning, ex.Message, ex);
            return BadRequestErrorMessage(ex.Message);
        }
    }
    
    [HttpPut]
    [Route(UpdateRoute)]
    public async Task<ActionResult<SurveyResponseDto>> UpdateSurvey(CreateSurveyRequestDto dto)
    {
        return null;
    }
    
    [HttpDelete]
    [Route(DeleteRoute)]
    public async Task<ActionResult> DeleteSurvey(string surveyId)
    {
        return null;
    }
    
    [HttpGet]
    [Route(GetAllRoute)]
    public async Task<ActionResult<SurveyResponseDto>> GetAllSurveys(CreateSurveyRequestDto requestDto)
    {
        return null;
    }
    
    [HttpPost]
    [Route(SubmitRoute)]
    public async Task<ActionResult<SurveyResponseDto>> SubmitResponse(CreateSurveyRequestDto requestDto)
    {
        return null;
    }
    
    [HttpGet]
    [Route(GetResultsRoute)]
    public async Task<ActionResult<SurveyResponseDto>> GetSurveysResults(CreateSurveyRequestDto requestDto)
    {
        return null;
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