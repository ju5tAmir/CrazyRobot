namespace Application.Models.Dtos.Surveys;

public class AnswerStatisticDto
{
    public string OptionText { get; set; } = null!;
    public int Count { get; set; }
    public double Percentage { get; set; }
}