using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using Application.Models;
using Core.Domain.Entities;

namespace Application.Services
{
    public class ContactService : IContactService
    {
        private readonly IContactRepository _repo;
        public ContactService(IContactRepository repo) => _repo = repo;

        public async Task<IEnumerable<ContactDto>> GetAllAsync() =>
            (await _repo.GetAllAsync()).Select(MapToDto);

        public async Task<ContactDto?> GetByIdAsync(string id)
        {
            var entity = await _repo.GetByIdAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<string> CreateAsync(ContactDto dto)
        {
            var entity = MapToEntity(dto);
            entity.Id = Guid.NewGuid().ToString();
            await _repo.AddAsync(entity);
            return entity.Id;
        }

        public async Task UpdateAsync(ContactDto dto) =>
            await _repo.UpdateAsync(MapToEntity(dto));

        public async Task DeleteAsync(string id) =>
            await _repo.DeleteAsync(id);

        // ─── mapping helpers ───────────────────────────────────────────────
        private static ContactDto MapToDto(SchoolContact c) => new()
        {
            Id         = c.Id,
            Name       = c.Name,
            Role       = c.Role,
            Department = c.Department,
            Email      = c.Email,
            Phone      = c.Phone,
            ImageUrl   = c.ImageUrl
        };

        private static SchoolContact MapToEntity(ContactDto d) => new()
        {
            Id         = d.Id,
            Name       = d.Name,
            Role       = d.Role,
            Department = d.Department,
            Email      = d.Email,
            Phone      = d.Phone,
            ImageUrl   = d.ImageUrl
        };
    }
}