using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class SurveyResponse
{
    public string Id { get; set; } = null!;

    public string SurveyId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public DateTime SubmittedAt { get; set; }

    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

    public virtual Survey Survey { get; set; } = null!;

    public virtual UserGuest User { get; set; } = null!;
}
