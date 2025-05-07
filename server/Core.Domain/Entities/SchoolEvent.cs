using System;

namespace Core.Domain.Entities
{
    public class SchoolEvent
    {
        public string Id           { get; set; } = Guid.NewGuid().ToString();
        public string Title        { get; set; } = null!;
        public string Description  { get; set; } = string.Empty;
        public DateOnly Date       { get; set; }
        public string Time         { get; set; } = string.Empty;
        public string Location     { get; set; } = string.Empty;
        public string Category     { get; set; } = string.Empty;
        public string   Status  { get; set; } = EventStatus.Upcoming;
    }
}