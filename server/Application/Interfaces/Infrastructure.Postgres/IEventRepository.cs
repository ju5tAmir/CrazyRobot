using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Domain.Entities;

namespace Application.Interfaces
{
    public interface IEventRepository
    {
        Task<IEnumerable<SchoolEvent>> GetAllAsync();
        Task<SchoolEvent?> GetByIdAsync(string id);
        Task AddAsync(SchoolEvent evt);
        Task UpdateAsync(SchoolEvent evt);
        Task DeleteAsync(string id);
    }
}