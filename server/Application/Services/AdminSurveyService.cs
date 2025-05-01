using System.ComponentModel.DataAnnotations;
using Application.Interfaces.Api.Rest;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Models.Dtos.Surveys;
using Core.Domain.Entities;

namespace Application.Services;

public class AdminSurveyService(IAdminSurveyRepository adminSurveyRepository) : IAdminSurveyService
{
    public async Task<SurveyResponseDto> CreateSurvey(CreateSurveyRequestDto dto, string userId)
    {
        //Validation
        if (string.IsNullOrEmpty(dto.Title))
            throw new ValidationException("Survey title is required");

        if (!dto.Questions.Any())
            throw new ValidationException("Survey must have at least one question");

        //Create survey
        var survey = await adminSurveyRepository.CreateSurvey(new Survey
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
            var question = await adminSurveyRepository.CreateQuestion(new Question
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
                await adminSurveyRepository.CreateQuestionOption(new QuestionOption
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

        var updatedSurvey = await adminSurveyRepository.UpdateSurvey(survey);
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
        await adminSurveyRepository.DeleteSurvey(surveyId);
    }

    public async Task<List<SurveyResponseDto>> GetAllSurveys()
    {
        var surveys = await adminSurveyRepository.GetAllSurveys();
        return surveys.Select(s => new SurveyResponseDto
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            SurveyType = s.SurveyType,
            IsActive = s.IsActive,
            CreatedByUserId = s.CreatedByUserId,
            CreatedAt = s.CreatedAt,
            Questions = s.Questions.Select(q => new QuestionDto
            {
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType,
                OrderNumber = q.OrderNumber,
                Options = q.QuestionOptions.Select(o => new QuestionOptionDto
                {
                    OptionText = o.OptionText,
                    OrderNumber = o.OrderNumber
                }).ToList()
            }).ToList()
        }).ToList();
    }

    public async Task<SurveyResultsDto> GetSurveyResults(string surveyId)
    {
        var survey = await adminSurveyRepository.GetSurveyWithResponses(surveyId);
        if (survey == null)
            throw new KeyNotFoundException("Survey not found");

        var questionResults = survey.Questions.Select(q =>
        {
            var questionResponses = survey.SurveyResponses
                .SelectMany(r => r.Answers)
                .Where(a => a.QuestionId == q.Id);

            var statistics = q.QuestionOptions
                .Select(o => new AnswerStatisticDto
                {
                    OptionText = o.OptionText,
                    Count = questionResponses.Count(r => r.AnswerText == o.OptionText),
                    Percentage = questionResponses.Any()
                        ? (double)questionResponses.Count(r => r.AnswerText == o.OptionText) /
                        questionResponses.Count() * 100
                        : 0
                })
                .ToList();

            return new QuestionResultDto
            {
                QuestionId = q.Id,
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType,
                Statistics = statistics
            };
        }).ToList();

        return new SurveyResultsDto
        {
            SurveyId = survey.Id,
            Title = survey.Title,
            TotalResponses = survey.SurveyResponses.Count,
            QuestionResults = questionResults
        };
    }


    public async Task<List<SurveyResultsDto>> GetAllSurveysResults()
    {
        var surveys = await adminSurveyRepository.GetAllSurveysWithResponses();

        return surveys.Select(survey =>
        {
            var questionResults = survey.Questions.Select(q =>
            {
                var questionResponses = survey.SurveyResponses
                    .SelectMany(r => r.Answers)
                    .Where(a => a.QuestionId == q.Id);

                var statistics = q.QuestionOptions
                    .Select(o => new AnswerStatisticDto
                    {
                        OptionText = o.OptionText,
                        Count = questionResponses.Count(r => r.AnswerText == o.OptionText),
                        Percentage = questionResponses.Any()
                            ? (double)questionResponses.Count(r => r.AnswerText == o.OptionText) /
                            questionResponses.Count() * 100
                            : 0
                    })
                    .ToList();

                return new QuestionResultDto
                {
                    QuestionId = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    Statistics = statistics
                };
            }).ToList();

            return new SurveyResultsDto
            {
                SurveyId = survey.Id,
                Title = survey.Title,
                TotalResponses = survey.SurveyResponses.Count,
                QuestionResults = questionResults
            };
        }).ToList();
    }
}   