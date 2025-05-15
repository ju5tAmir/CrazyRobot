using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class GeneratedReport
{
    public int Id { get; set; }

    public string SurveyId { get; set; } = null!;

    public DateTime GeneratedAt { get; set; }

    public string ReportText { get; set; } = null!;
}
