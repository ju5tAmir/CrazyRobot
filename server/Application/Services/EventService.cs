using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Interfaces;
using Application.Models;
using Core.Domain.Entities;

namespace Application.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _repo;
        public EventService(IEventRepository repo) => _repo = repo;

        public async Task<IEnumerable<EventDto>> GetAllAsync() =>
            (await _repo.GetAllAsync()).Select(MapToDto);

        public async Task<EventDto?> GetByIdAsync(string id)
        {
            var entity = await _repo.GetByIdAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<string> CreateAsync(EventDto dto)
        {
            var entity = MapToEntity(dto);
            entity.Id = Guid.NewGuid().ToString();
            await _repo.AddAsync(entity);
            return entity.Id;
        }

        public async Task UpdateAsync(EventDto dto) =>
            await _repo.UpdateAsync(MapToEntity(dto));

        public async Task DeleteAsync(string id) =>
            await _repo.DeleteAsync(id);

        // ─── mapping helpers ───────────────────────────────────────────────
        private static EventDto MapToDto(SchoolEvent e) => new()
        {
            Id          = e.Id,
            Title       = e.Title,
            Description = e.Description,
            Date        = e.Date,
            Time        = e.Time,
            Location    = e.Location,
            Category    = e.Category,
            Status      = e.Status
        };

        private static SchoolEvent MapToEntity(EventDto d) => new()
        {
            Id          = d.Id,
            Title       = d.Title,
            Description = d.Description,
            Date        = d.Date,
            Time        = d.Time,
            Location    = d.Location,
            Category    = d.Category,
            Status      = d.Status
        };
    }
}