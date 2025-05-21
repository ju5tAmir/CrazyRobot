namespace Application.Models.Dtos.Surveys;

public class QuestionDto
{
    public string? Id { get; set; }
    public string QuestionText { get; set; } = null!;
    public string QuestionType { get; set; } = null!;
    public int OrderNumber { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
}