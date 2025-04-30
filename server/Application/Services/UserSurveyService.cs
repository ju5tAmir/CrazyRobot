using Application.Interfaces.Api.Rest;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Models.Dtos.Surveys;
using Core.Domain.Entities;

namespace Application.Services;

public class UserSurveyService(IUserSurveyRepository userSurveyRepository) : IUserSurveyService
{
    public async Task<SurveySubmissionResponseDto> SubmitResponse(SurveySubmissionRequestDto requestDto, string userId)
    {
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
                AnswerText = r.Response
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
                Response = r.AnswerText
            }).ToList()
        };
    }
}