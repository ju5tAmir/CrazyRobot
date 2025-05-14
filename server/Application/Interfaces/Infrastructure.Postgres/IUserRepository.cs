using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IUserRepository
{
    List<User> GetAll();
    User? GetUserByIdOrNull(string email);
    UserGuest? GetGuestByIdOrNull(string email);
    User AddAdmin(User user);
    UserGuest AddUser(UserGuest user);
    bool DeleteUser(string userId);
}