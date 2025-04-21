using System;

namespace Core.Domain.Entities
{
    public class SchoolContact
    {
        public string Id         { get; set; } = Guid.NewGuid().ToString();
        public string Name       { get; set; } = null!;
        public string Role       { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Email      { get; set; } = string.Empty;
        public string Phone      { get; set; } = string.Empty;
        public string? ImageUrl  { get; set; }
    }
}