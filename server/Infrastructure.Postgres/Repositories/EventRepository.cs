using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Interfaces;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly AppDbContext _ctx;
        public EventRepository(AppDbContext ctx) => _ctx = ctx;

        public async Task<IEnumerable<SchoolEvent>> GetAllAsync() =>
            await _ctx.Events.ToListAsync();

        public async Task<SchoolEvent?> GetByIdAsync(string id) =>
            await _ctx.Events.FindAsync(id);

        public async Task AddAsync(SchoolEvent evt)
        {
            await _ctx.Events.AddAsync(evt);
            await _ctx.SaveChangesAsync();
        }

        public async Task UpdateAsync(SchoolEvent evt)
        {
            _ctx.Events.Update(evt);
            await _ctx.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await _ctx.Events.FindAsync(id);
            if (entity == null) return;
            _ctx.Events.Remove(entity);
            await _ctx.SaveChangesAsync();
        }
    }
}