using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class QuestionOption
{
    public string Id { get; set; } = null!;

    public string QuestionId { get; set; } = null!;

    public string OptionText { get; set; } = null!;

    public int OrderNumber { get; set; }

    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

    public virtual Question Question { get; set; } = null!;
}
