using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class AdminSurveyRepository(AppDbContext dbContext) :  IAdminSurveyRepository
{
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

    public async Task<(Survey Survey, List<Question> Questions, List<QuestionOption> Options)> CreateSurveyWithQuestionsAndOptions(Survey survey, List<Question> questions, List<QuestionOption> options)
    {
        using var transaction = await dbContext.Database.BeginTransactionAsync();
        try
        {
            // Add a survey
            dbContext.Surveys.Add(survey);
            await dbContext.SaveChangesAsync();
            
            // Add questions
            await dbContext.Questions.AddRangeAsync(questions);
            await dbContext.SaveChangesAsync();
            
            // Add options
            await dbContext.QuestionOptions.AddRangeAsync(options);
            await dbContext.SaveChangesAsync();
            
            await transaction.CommitAsync();
            return (survey, questions, options);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<(Survey Survey, List<Question> Questions, List<QuestionOption> Options)> UpdateSurveyWithQuestionsAndOptions(Survey survey, List<Question> questions, List<QuestionOption> options)
    {
        using var transaction = await dbContext.Database.BeginTransactionAsync();
        try
        {
            // Update survey
            var existingSurvey = await dbContext.Surveys.FindAsync(survey.Id);
            if (existingSurvey == null) throw new KeyNotFoundException("Survey not found");
            
            dbContext.Entry(existingSurvey).CurrentValues.SetValues(survey);
            
            // Delete existing questions and options for this survey
            var existingQuestions = await dbContext.Questions
                .Where(q => q.SurveyId == survey.Id)
                .Include(q => q.QuestionOptions)
                .ToListAsync();
            
            foreach (var question in existingQuestions)
            {
                dbContext.QuestionOptions.RemoveRange(question.QuestionOptions);
            }
            dbContext.Questions.RemoveRange(existingQuestions);
            
            // Add new questions and options
            await dbContext.Questions.AddRangeAsync(questions);
            await dbContext.SaveChangesAsync();
            
            await dbContext.QuestionOptions.AddRangeAsync(options);
            await dbContext.SaveChangesAsync();
            
            await transaction.CommitAsync();
            return (survey, questions, options);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}