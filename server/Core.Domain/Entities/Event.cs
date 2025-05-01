using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Event
{
    public string Id { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public DateOnly Date { get; set; }

    public string Time { get; set; } = null!;

    public string Location { get; set; } = null!;

    public string Category { get; set; } = null!;

    public string Status { get; set; } = null!;
}
