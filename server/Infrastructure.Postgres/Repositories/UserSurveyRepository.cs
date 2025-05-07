using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class UserSurveyRepository(AppDbContext dbContext) : IUserSurveyRepository
{
    public async Task<SurveyResponse> CreateSurveyResponse(SurveyResponse response)
    {
        dbContext.SurveyResponses.Add(response);
        await dbContext.SaveChangesAsync();
        return response;
    }

    public async Task<List<Survey>> GetActiveSurveys()
    {
        return await dbContext.Surveys
            .Where(s => s.IsActive)
            .Include(s => s.Questions)
            .ThenInclude(q => q.QuestionOptions)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }
}