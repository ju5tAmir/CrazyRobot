using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Models;

namespace Application.Interfaces
{
    public interface IContactService
    {
        Task<IEnumerable<ContactDto>> GetAllAsync();
        Task<ContactDto?> GetByIdAsync(string id);
        Task<string> CreateAsync(ContactDto dto);
        Task UpdateAsync(ContactDto dto);
        Task DeleteAsync(string id);
    }
}