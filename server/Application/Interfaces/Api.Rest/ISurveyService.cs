using Application.Models.Dtos.Surveys;

namespace Application.Interfaces.Api.Rest;

public interface ISurveyService
{
    Task<SurveyResponseDto> CreateSurvey(CreateSurveyRequestDto dto, string userId);
    Task<SurveyResponseDto> UpdateSurvey(UpdateSurveyRequestDto dto, string userId);
    Task DeleteSurvey(string surveyId, string userId);
    Task<List<SurveyResponseDto>> GetAllSurveys();
}