using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Domain.Entities;

namespace Application.Interfaces
{
    public interface IContactRepository
    {
        Task<IEnumerable<SchoolContact>> GetAllAsync();
        Task<SchoolContact?> GetByIdAsync(string id);
        Task AddAsync(SchoolContact contact);
        Task UpdateAsync(SchoolContact contact);
        Task DeleteAsync(string id);
    }
}