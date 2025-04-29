using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;

namespace Infrastructure.Postgres.Repositories;

public class UserSurveyRepository(AppDbContext dbContext) : IUserSurveyRepository
{
    public async Task<SurveyResponse> CreateSurveyResponse(SurveyResponse response)
    {
        dbContext.SurveyResponses.Add(response);
        await dbContext.SaveChangesAsync();
        return response;
    }
}