using System.ComponentModel.DataAnnotations;
using Application.Interfaces.Api.Rest;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Models.Dtos.Surveys;
using Core.Domain.Entities;

namespace Application.Services;

public class SurveyService(ISurveyRepository surveyRepository) : ISurveyService
{
    public async Task<SurveyResponseDto> CreateSurvey(CreateSurveyRequestDto dto, string userId)
    {
        //Validation
        if(string.IsNullOrEmpty(dto.Title))
            throw new ValidationException("Survey title is required");
        
        if(!dto.Questions.Any())
            throw new ValidationException("Survey must have at least one question");
        
        //Create survey
        var survey = await surveyRepository.CreateSurvey(new Survey
        {
            Id = Guid.NewGuid().ToString(),
            Title = dto.Title,
            Description = dto.Description,
            SurveyType = dto.SurveyType,
            CreatedByUserId = userId,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        });
        
        //Create questions and options
        foreach (var questionDto in dto.Questions)
        {
            var question = await surveyRepository.CreateQuestion(new Question
            {
                Id = Guid.NewGuid().ToString(),
                SurveyId = survey.Id,
                QuestionText = questionDto.QuestionText,
                QuestionType = questionDto.QuestionType,
                OrderNumber = questionDto.OrderNumber
            });
            
            //Add options
            foreach (var optionDto in questionDto.Options)
            {
                await surveyRepository.CreateQuestionOption(new QuestionOption
                {
                    Id = Guid.NewGuid().ToString(),
                    QuestionId = question.Id,
                    OptionText = optionDto.OptionText,
                    OrderNumber = optionDto.OrderNumber
                });
            }
        }

        return new SurveyResponseDto
        {
            Id = survey.Id,
            Title = survey.Title,
            Description = survey.Description,
            SurveyType = survey.SurveyType,
            IsActive = survey.IsActive,
            CreatedByUserId = survey.CreatedByUserId,
            CreatedAt = survey.CreatedAt,
            Questions = dto.Questions,
        };
    }

    public async Task<SurveyResponseDto> UpdateSurvey(UpdateSurveyRequestDto dto, string userId)
    {
        if (string.IsNullOrEmpty(dto.Title))
            throw new ValidationException("Survey title is required");
        
        var survey = new Survey
        {
            Id = dto.Id,
            Title = dto.Title,
            Description = dto.Description,
            SurveyType = dto.SurveyType,
            CreatedByUserId = userId,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
        };

        var updatedSurvey = await surveyRepository.UpdateSurvey(survey);
        return new SurveyResponseDto
        {
            Id = updatedSurvey.Id,
            Title = updatedSurvey.Title,
            Description = updatedSurvey.Description,
            SurveyType = updatedSurvey.SurveyType,
            IsActive = updatedSurvey.IsActive,
            CreatedByUserId = updatedSurvey.CreatedByUserId,
            CreatedAt = updatedSurvey.CreatedAt,
            Questions = dto.Questions
        };
    }

    public async Task DeleteSurvey(string surveyId, string userId)
    {
        await surveyRepository.DeleteSurvey(surveyId);
    }

    public async Task<List<SurveyResponseDto>> GetAllSurveys()
    {
        var surveys = await surveyRepository.GetAllSurveys();
        return surveys.Select(s => new SurveyResponseDto
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            SurveyType = s.SurveyType,
            IsActive = s.IsActive,
            CreatedByUserId = s.CreatedByUserId,
            CreatedAt = s.CreatedAt
        }).ToList();
    }
}