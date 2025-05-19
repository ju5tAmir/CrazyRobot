using Api.Rest.ErrorHandling;
using Api.Rest.Extensions.AuthExtension;
using Application.Interfaces.Api.Rest;
using Application.Interfaces.Security;
using Application.Models.Dtos.Surveys;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Surveys;

public class UserSurveysController(ISecurityService securityService, IUserSurveyService userSurveyService, ILogger<AdminSurveysController> logger) : ControllerBase
{
    private const string ControllerRoute = "api/survey-submission/";
    private const string SubmitRoute = ControllerRoute + nameof(SubmitResponse);
    private const string GetActiveSurveysRoute = ControllerRoute + nameof(GetActiveSurveys);

    
    [HttpPost]
    [Route(SubmitRoute)]
    public async Task<ActionResult<SurveySubmissionResponseDto>> SubmitResponse([FromBody] SurveySubmissionRequestDto requestDto)
    {
        try
        {
            var list = requestDto.Responses.Select(r => r.Response).ToList();
            Console.WriteLine("HEREEEEEEEEEEEEEEEEEEE: " + list.First());
            
            foreach (var response in requestDto.Responses)
            {
                Console.WriteLine($"QuestionId: {response.QuestionId}, Response: '{response.Response}'");
            }
            
            var user = securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
            var result = await userSurveyService.SubmitResponse(requestDto, user.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.Log(LogLevel.Warning, ex.Message, ex);
            return BadRequestErrorMessage(ex.Message);
        }
    }
    
    [HttpGet]
    [Route(GetActiveSurveysRoute)]
    public async Task<ActionResult<List<SurveyResponseDto>>> GetActiveSurveys()
    {
        try
        {
            var surveys = await userSurveyService.GetActiveSurveys();
            return Ok(surveys);
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