namespace Application.Models.Dtos.Rest;

public class ChangeSubscriptionDto
{
    public string ClientId { get; set; }
    public List<string> TopicIds { get; set; }
}