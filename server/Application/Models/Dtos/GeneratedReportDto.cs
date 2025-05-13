namespace Application.Models;

public class GeneratedReportDto
{
    public int      Id           { get; set; }
    public string  SurveyId     { get; set; }
    public DateTime GeneratedAt  { get; set; }
    public string   ReportText   { get; set; } = null!;
}