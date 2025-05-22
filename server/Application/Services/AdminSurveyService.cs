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

        //Create a survey
        var survey = new Survey
        {
            Id = Guid.NewGuid().ToString(),
            Title = dto.Title,
            Description = dto.Description,
            SurveyType = dto.SurveyType,
            CreatedByUserId = userId,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        var questions = new List<Question>();
        var options = new List<QuestionOption>();
        
        foreach (var questionDto in dto.Questions)
        {
            var question = new Question
            {
                Id = Guid.NewGuid().ToString(),
                SurveyId = survey.Id,
                QuestionText = questionDto.QuestionText,
                QuestionType = questionDto.QuestionType,
                OrderNumber = questionDto.OrderNumber
            };
            
            questions.Add(question);
            
            foreach (var optionDto in questionDto.Options)
            {
                var option = new QuestionOption
                {
                    Id = Guid.NewGuid().ToString(),
                    QuestionId = question.Id,
                    OptionText = optionDto.OptionText,
                    OrderNumber = optionDto.OrderNumber
                };
                
                options.Add(option);
            }
        }
        
        var result = await adminSurveyRepository.CreateSurveyWithQuestionsAndOptions(survey, questions, options);
        
        return new SurveyResponseDto
        {
            Id = result.Survey.Id,
            Title = result.Survey.Title,
            Description = result.Survey.Description,
            SurveyType = result.Survey.SurveyType,
            IsActive = result.Survey.IsActive,
            CreatedByUserId = result.Survey.CreatedByUserId,
            CreatedAt = result.Survey.CreatedAt,
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
        
        var questions = new List<Question>();
        var options = new List<QuestionOption>();

        foreach (var questionDto in dto.Questions)
        {
            var question = new Question
            {
                Id = Guid.NewGuid().ToString(),
                SurveyId = survey.Id,
                QuestionText = questionDto.QuestionText,
                QuestionType = questionDto.QuestionType,
                OrderNumber = questionDto.OrderNumber
            };
            
            questions.Add(question);

            foreach (var optionDto in questionDto.Options)
            {
                var option = new QuestionOption
                {
                    Id = Guid.NewGuid().ToString(),
                    QuestionId = question.Id,
                    OptionText = optionDto.OptionText,
                    OrderNumber = optionDto.OrderNumber
                };
                
                options.Add(option);
            }
        }
        
        // Save everything in a single transaction
        var result = await adminSurveyRepository.UpdateSurveyWithQuestionsAndOptions(survey, questions, options);
        
        return new SurveyResponseDto
        {
            Id = result.Survey.Id,
            Title = result.Survey.Title,
            Description = result.Survey.Description,
            SurveyType = result.Survey.SurveyType,
            IsActive = result.Survey.IsActive,
            CreatedByUserId = result.Survey.CreatedByUserId,
            CreatedAt = result.Survey.CreatedAt,
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
            Questions = s.Questions
                .OrderBy(q => q.OrderNumber)
                .Select(q => new QuestionDto
                {
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

    public async Task<List<SurveyResultsDto>> GetAllSurveysResults()
{
    var surveys = await adminSurveyRepository.GetAllSurveysWithResponses();

    return surveys.Select(survey =>
    {
        var questionResults = survey.Questions
            .OrderBy(q => q.OrderNumber)
            .Select(q =>
            {
                var questionResponses = survey.SurveyResponses
                    .SelectMany(r => r.Answers)
                    .Where(a => a.QuestionId == q.Id);

                List<AnswerStatisticDto> statistics;

                // For text questions, just list the answers without statistics
                if (!q.QuestionOptions.Any())
                {
                    statistics = questionResponses
                        .Select(r => new AnswerStatisticDto
                        {
                            OptionText = r.AnswerText ?? string.Empty,
                            Count = 0,  
                            Percentage = 0  
                        })
                        .ToList();
                }
                // For multiple choice questions, calculate statistics
                else
                {
                    var responsesList = questionResponses.ToList();
                    int totalResponses = responsesList.Count();
                    bool hasAnyResponses = totalResponses > 0;
                    
                    statistics = q.QuestionOptions
                        .OrderBy(o => o.OrderNumber)
                        .Select(o => 
                        {
                            int matchCount = responsesList.Count(r => r.AnswerText == o.OptionText);
                            return new AnswerStatisticDto
                            {
                                OptionText = o.OptionText,
                                Count = matchCount,
                                Percentage = hasAnyResponses
                                    ? (double)matchCount / totalResponses * 100
                                    : 0
                            };
                        })
                        .ToList();
                }

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