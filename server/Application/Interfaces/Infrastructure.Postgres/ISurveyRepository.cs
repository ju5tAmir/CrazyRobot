using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface ISurveyRepository
{
    Task<Survey> CreateSurvey(Survey survey);
    Task<Question> CreateQuestion(Question question);
    Task<QuestionOption> CreateQuestionOption(QuestionOption option);
}