namespace Api.Rest.ErrorHandling;

public class BadRequest
{
    public BadRequest(ValidationErrors errors)
    {
        Errors = errors;
    }

    public string Type { get; set; } = "Bad Request";
    public string Title { get; set; } = "One or more validation errors occurred.";
    public int Status { get; set; } = 400;
    public ValidationErrors Errors { get; set; } = new ValidationErrors();
}

public class ValidationErrors
{
    public string[] File { get; set; } = Array.Empty<string>();
    public string[] Message { get; set; } = Array.Empty<string>();
}