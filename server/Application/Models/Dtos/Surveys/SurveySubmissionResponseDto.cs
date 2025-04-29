namespace Application.Models.Dtos.Surveys;

public class SurveySubmissionResponseDto
{
    public string Id { get; set; }
    public string SurveyId { get; set; } = null!;
    public List<QuestionResponseDto> Responses { get; set; } = new();
}