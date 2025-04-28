namespace Application.Models.Dtos.Surveys;

public class UpdateSurveyRequestDto
{
    public string Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string SurveyType { get; set; } = null!;
    public bool IsActive { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
}