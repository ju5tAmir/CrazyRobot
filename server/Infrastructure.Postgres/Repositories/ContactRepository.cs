using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Interfaces;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres
{
    public class ContactRepository : IContactRepository
    {
        private readonly AppDbContext _ctx;
        public ContactRepository(AppDbContext ctx) => _ctx = ctx;

        public async Task<IEnumerable<SchoolContact>> GetAllAsync() =>
            await _ctx.Contacts.ToListAsync();

        public async Task<SchoolContact?> GetByIdAsync(string id) =>
            await _ctx.Contacts.FindAsync(id);

        public async Task AddAsync(SchoolContact contact)
        {
            await _ctx.Contacts.AddAsync(contact);
            await _ctx.SaveChangesAsync();
        }

        public async Task UpdateAsync(SchoolContact contact)
        {
            _ctx.Contacts.Update(contact);
            await _ctx.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await _ctx.Contacts.FindAsync(id);
            if (entity == null) return;
            _ctx.Contacts.Remove(entity);
            await _ctx.SaveChangesAsync();
        }
    }
}