using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Contact
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string Department { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string? ImageUrl { get; set; }
}
