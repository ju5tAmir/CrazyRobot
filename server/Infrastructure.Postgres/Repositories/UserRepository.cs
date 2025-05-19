using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;

namespace Infrastructure.Postgres.Repositories;

public class UserRepository(AppDbContext ctx) : IUserRepository
{
    public List<User> GetAll()
    {
        return ctx.Users.ToList();
    }

    public User? GetUserByIdOrNull(string email)
    {
        return ctx.Users.FirstOrDefault(u => u.Email == email);
    }
    
    public UserGuest? GetGuestByIdOrNull(string email)
    {
        return ctx.UserGuests.FirstOrDefault(u => u.Email == email);
    }

    public async Task<User> AddAdmin(User user)
    {
        await ctx.Users.AddAsync(user);
        await ctx.SaveChangesAsync();
        return user;
    }
    
    public UserGuest AddUser(UserGuest user)
    {
        ctx.UserGuests.Add(user);
        ctx.SaveChanges();
        return user;
    }

    public bool DeleteUser(string userId)
    {
        var user = ctx.Users.Find(userId);
        ctx.Users.Remove(user);
        return ctx.SaveChanges() > 0;
    }
    
    public bool IsUsernameTaken(string username)
    {
        return ctx.UserGuests.Any(u => u.Username == username);
    }
}