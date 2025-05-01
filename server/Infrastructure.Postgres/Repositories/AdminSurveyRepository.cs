using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class AdminSurveyRepository(AppDbContext dbContext) :  IAdminSurveyRepository
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

    public async Task<Survey> UpdateSurvey(Survey survey)
    {
        var existingSurvey = await dbContext.Surveys.FindAsync(survey.Id);
        if (existingSurvey == null) throw new KeyNotFoundException("Survey not found");
        
        dbContext.Entry(existingSurvey).CurrentValues.SetValues(survey);
        await dbContext.SaveChangesAsync();
        return survey;
    }

    public async Task DeleteSurvey(string surveyId)
    {
        var survey = await dbContext.Surveys.FindAsync(surveyId);
        if (survey == null) throw new KeyNotFoundException("Survey not found");
        
        dbContext.Surveys.Remove(survey);
        await dbContext.SaveChangesAsync();
    }

    public async Task<List<Survey>> GetAllSurveys()
    {
        return await dbContext.Surveys
            .Include(s => s.Questions)
            .ThenInclude(q => q.QuestionOptions)
            .ToListAsync();
    }

    public async Task<List<Survey>> GetAllSurveysWithResponses()
    {
        return await dbContext.Surveys
            .Include(s => s.Questions)
            .ThenInclude(q => q.QuestionOptions)
            .Include(s => s.SurveyResponses)
            .ThenInclude(sr => sr.Answers)
            .ToListAsync();
    }

    public async Task<Survey?> GetSurveyWithResponses(string surveyId)
    {
        return await dbContext.Surveys
            .Include(s => s.Questions)
            .ThenInclude(q => q.QuestionOptions)
            .Include(s => s.SurveyResponses)
            .ThenInclude(sr => sr.Answers)
            .FirstOrDefaultAsync(s => s.Id == surveyId);
    }

    public async Task<Survey> GetSurveyById(string surveyId)
    {
        return await dbContext.Surveys.FindAsync(surveyId);
    }
}