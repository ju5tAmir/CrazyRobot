namespace Application.Models.Dtos.Surveys;

public class QuestionResponseDto
{
    public string QuestionId { get; set; } = null!;
    public string? Response { get; set; } = null!;
    public string? OptionId { get; set; } = null!;
}