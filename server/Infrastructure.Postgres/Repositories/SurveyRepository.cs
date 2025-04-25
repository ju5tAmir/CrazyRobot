using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;

namespace Infrastructure.Postgres.Repositories;

public class SurveyRepository(AppDbContext dbContext) :  ISurveyRepository
{
    public async Task<Survey> CreateSurvey(Survey survey)
    {
        dbContext.Surveys.Add(survey);
        await dbContext.SaveChangesAsync();
        return survey;
    }

    public async Task<Question> CreateQuestion(Question question)
    {
        dbContext.Questions.Add(question);
        await dbContext.SaveChangesAsync();
        return question;
    }

    public async Task<QuestionOption> CreateQuestionOption(QuestionOption option)
    {
        dbContext.QuestionOptions.Add(option);
        await dbContext.SaveChangesAsync();
        return option;
    }
}