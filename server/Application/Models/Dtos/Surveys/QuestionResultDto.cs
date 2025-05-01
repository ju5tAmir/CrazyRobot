namespace Application.Models.Dtos.Surveys;

public class QuestionResultDto
{
    public string QuestionId { get; set; } = null!;
    public string QuestionText { get; set; } = null!;
    public string QuestionType { get; set; } = null!;
    public List<AnswerStatisticDto> Statistics { get; set; } = new();
}