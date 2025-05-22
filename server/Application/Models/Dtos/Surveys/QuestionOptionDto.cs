namespace Application.Models.Dtos.Surveys;

public class QuestionOptionDto
{
    public string Id { get; set; } = null!;
    public string OptionText { get; set; } = null!;
    public int OrderNumber { get; set; }
}