namespace Application.Models
{
    public class ContactDto
    {
        public string? Id { get; set; }

        public string Name       { get; set; } = null!;
        public string Role       { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Email      { get; set; } = string.Empty;
        public string Phone      { get; set; } = string.Empty;
        public string? ImageUrl  { get; set; }
    }
}