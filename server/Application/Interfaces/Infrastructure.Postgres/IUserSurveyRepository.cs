using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IUserSurveyRepository
{
    Task<SurveyResponse> CreateSurveyResponse(SurveyResponse response);
    Task<List<Survey>> GetActiveSurveys();

}