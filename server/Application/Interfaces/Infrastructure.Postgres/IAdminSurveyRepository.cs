using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IAdminSurveyRepository
{
    Task<Survey> CreateSurvey(Survey survey);
    Task<Question> CreateQuestion(Question question);
    Task<QuestionOption> CreateQuestionOption(QuestionOption option);
    Task<Survey> UpdateSurvey(Survey survey);
    Task DeleteSurvey(string surveyId);
    
    Task<Survey> GetSurveyById(string surveyId);
    Task<List<Survey>> GetAllSurveys();
    
    Task<List<Survey>> GetAllSurveysWithResponses();
    Task<Survey?> GetSurveyWithResponses(string surveyId);}