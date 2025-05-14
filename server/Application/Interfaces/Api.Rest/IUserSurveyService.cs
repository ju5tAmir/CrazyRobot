using Application.Models.Dtos.Surveys;
using Core.Domain.Entities;

namespace Application.Interfaces.Api.Rest;

public interface IUserSurveyService
{
    Task<SurveySubmissionResponseDto> SubmitResponse(SurveySubmissionRequestDto requestDto, string userId);
    Task<List<SurveyResponseDto>> GetActiveSurveys();
}