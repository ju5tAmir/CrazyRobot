using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IUserRepository
{
    List<User> GetAll();
    User? GetUserByIdOrNull(string email);
    User AddUser(User user);
    bool DeleteUser(string userId);
}