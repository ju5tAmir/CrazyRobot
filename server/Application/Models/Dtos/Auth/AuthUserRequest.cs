using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.Auth;

public class AuthUserRequest
{
    [MinLength(1)] [Required] public string Username { get; set; } = null!;
    [MinLength(3)] [Required] public string Email { get; set; } = null!;
    [Required] public string Role { get; set; } = null!;

}