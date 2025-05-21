namespace Application.Models.Dtos.Surveys;

public class SurveyResultsDto
{
    public string SurveyId { get; set; } = null!;
    public string Title { get; set; } = null!;
    public int TotalResponses { get; set; }
    public List<QuestionResultDto> QuestionResults { get; set; } = new();
}