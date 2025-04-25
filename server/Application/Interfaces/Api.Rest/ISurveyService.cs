using Application.Models.Dtos.Surveys;

namespace Application.Interfaces.Api.Rest;

public interface ISurveyService
{
    Task<SurveyResponseDto> CreateSurvey(CreateSurveyRequestDto dto, string createdByUserId);
}