using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Answer
{
    public string Id { get; set; } = null!;

    public string SurveyResponseId { get; set; } = null!;

    public string QuestionId { get; set; } = null!;

    public string? AnswerText { get; set; }

    public string? SelectedOptionId { get; set; }

    public virtual Question Question { get; set; } = null!;

    public virtual QuestionOption? SelectedOption { get; set; }

    public virtual SurveyResponse SurveyResponse { get; set; } = null!;
}
