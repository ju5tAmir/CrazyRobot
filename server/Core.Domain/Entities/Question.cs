using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Question
{
    public string Id { get; set; } = null!;

    public string SurveyId { get; set; } = null!;

    public string QuestionText { get; set; } = null!;

    public string QuestionType { get; set; } = null!;

    public int OrderNumber { get; set; }

    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

    public virtual ICollection<QuestionOption> QuestionOptions { get; set; } = new List<QuestionOption>();

    public virtual Survey Survey { get; set; } = null!;
}
