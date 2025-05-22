using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Models;

namespace Application.Interfaces
{
    public interface IEventService
    {
        Task<IEnumerable<EventDto>> GetAllAsync();
        Task<EventDto?> GetByIdAsync(string id);
        Task<string> CreateAsync(EventDto dto);
        Task UpdateAsync(EventDto dto);
        Task DeleteAsync(string id);
    }
}