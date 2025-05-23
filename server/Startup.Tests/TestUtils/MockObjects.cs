using Application.Models.Enums;
using Core.Domain.Entities;

namespace Startup.Tests.TestUtils;

public static class MockObjects
{
    public static UserGuest GetUser(string? role = null)
    {
        return new UserGuest
        {
            Role = role ?? Roles.UserRole,
            Email = "test" + Guid.NewGuid() + "@test.com",
            Id = Guid.NewGuid().ToString(),
            Username = "test"
        };
    }
    
    public static User GetAdmin(string? role = null)
    {
        return new User
        {
            Role = role ?? Roles.AdminRole,
            Email = "test" + Guid.NewGuid() + "@test.com",
            Id = Guid.NewGuid().ToString(),
            Salt = "word", //password is "pass" and the hash is the combined pass + word hashed together 
            Hash =
                "b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86"
        };
    }

    public static Survey GetSurvey(string adminId)
    {
        var surveyId = Guid.NewGuid().ToString();
        return new Survey
        {
            Id = surveyId,
            Title = "Original Survey",
            Description = "Original Description",
            SurveyType = "Feedback",
            CreatedByUserId = adminId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            Questions = new List<Question>
            {
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    SurveyId = surveyId,
                    QuestionText = "Original Question",
                    QuestionType = "Text",
                    OrderNumber = 1,
                    QuestionOptions = new List<QuestionOption>()
                }
            }
        };
    }
    
    public static SurveyResponse GetSurveyResponse(Survey survey, string userId)
    {
        var surveyResponseId = Guid.NewGuid().ToString();
        return new SurveyResponse
        {
            Id = surveyResponseId,
            SurveyId = survey.Id,
            UserId = userId,
            SubmittedAt = DateTime.UtcNow,
            Answers = new List<Answer>()
            {
                new()
                {
                    Id = Guid.NewGuid().ToString(),
                    SurveyResponseId = surveyResponseId,
                    QuestionId = survey.Questions.First().Id,
                    AnswerText = "Original Answer"
                }
            }
        };
    }
}