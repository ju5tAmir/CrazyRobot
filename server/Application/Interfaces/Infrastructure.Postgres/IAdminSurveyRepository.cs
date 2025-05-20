using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IAdminSurveyRepository
{
    Task DeleteSurvey(string surveyId);
    Task<List<Survey>> GetAllSurveys();
    Task<List<Survey>> GetAllSurveysWithResponses();
    
    Task<(Survey Survey, List<Question> Questions, List<QuestionOption> Options)> CreateSurveyWithQuestionsAndOptions(Survey survey, List<Question> questions, List<QuestionOption> options);
    
    Task<(Survey Survey, List<Question> Questions, List<QuestionOption> Options)> UpdateSurveyWithQuestionsAndOptions(Survey survey, List<Question> questions, List<QuestionOption> options);
}