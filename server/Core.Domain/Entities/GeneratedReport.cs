namespace Core.Domain.Entities;

public class GeneratedReport
{
    public int      Id          { get; set; }
    public string   SurveyId    { get; set; }
    public DateTime GeneratedAt { get; set; }
    public string   ReportText  { get; set; } = null!;
}