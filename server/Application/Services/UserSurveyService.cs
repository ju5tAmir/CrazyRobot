using Application.Interfaces.Api.Rest;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Models.Dtos.Surveys;
using Core.Domain.Entities;

namespace Application.Services;

public class UserSurveyService(IUserSurveyRepository userSurveyRepository) : IUserSurveyService
{
    public async Task<SurveySubmissionResponseDto> SubmitResponse(SurveySubmissionRequestDto requestDto, string userId)
    {
        // Validation
        if (requestDto == null)
            throw new ArgumentNullException(nameof(requestDto));
    
        if (string.IsNullOrEmpty(requestDto.SurveyId))
            throw new ArgumentException("Survey ID cannot be empty");
    
        if (requestDto.Responses == null || !requestDto.Responses.Any())
            throw new ArgumentException("Survey must have at least one response");
        
        var surveyResponseId = Guid.NewGuid().ToString();
        
        var surveyResponse = new SurveyResponse
        {
            Id = surveyResponseId,
            SurveyId = requestDto.SurveyId,
            UserId = userId,
            SubmittedAt = DateTime.UtcNow,
            Answers = requestDto.Responses.Select(r => new Answer
            {
                Id = Guid.NewGuid().ToString(),
                SurveyResponseId = surveyResponseId,
                QuestionId = r.QuestionId,
                AnswerText = r.Response,
                SelectedOptionId = r.OptionId
            }).ToList()
        };

        await userSurveyRepository.CreateSurveyResponse(surveyResponse);
        return new SurveySubmissionResponseDto
        {
            Id = surveyResponse.Id,
            SurveyId = requestDto.SurveyId,
            Responses = surveyResponse.Answers.Select(r => new QuestionResponseDto
            {
                QuestionId = r.QuestionId,
                Response = r.AnswerText,
                OptionId = r.SelectedOptionId,
            }).ToList()
        };
    }

    public async Task<List<SurveyResponseDto>> GetActiveSurveys()
    {
        var surveys = await userSurveyRepository.GetActiveSurveys();
        return surveys.Select(s => new SurveyResponseDto
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            SurveyType = s.SurveyType,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt,
            Questions = s.Questions
                .OrderBy(q => q.OrderNumber)
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    OrderNumber = q.OrderNumber,
                    Options = q.QuestionOptions
                        .OrderBy(o => o.OrderNumber)
                        .Select(o => new QuestionOptionDto
                        {
                            Id = o.Id,
                            OptionText = o.OptionText,
                            OrderNumber = o.OrderNumber
                        })
                        .ToList()
                })
                .ToList()
        }).ToList();
    }
}