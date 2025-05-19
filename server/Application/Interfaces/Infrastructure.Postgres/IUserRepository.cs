using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IUserRepository
{
    List<User> GetAll();
    User? GetUserByIdOrNull(string email);
    UserGuest? GetGuestByIdOrNull(string email);
    Task<User> AddAdmin(User user);
    UserGuest AddUser(UserGuest user);
    bool IsUsernameTaken(string username);
    bool DeleteUser(string userId);
}