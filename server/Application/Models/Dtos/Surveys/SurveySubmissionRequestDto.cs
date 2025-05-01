namespace Application.Models.Dtos.Surveys;

public class SurveySubmissionRequestDto
{
    public string SurveyId { get; set; } = null!;
    public List<QuestionResponseDto> Responses { get; set; } = new();
}