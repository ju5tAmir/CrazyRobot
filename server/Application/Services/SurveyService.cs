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
}