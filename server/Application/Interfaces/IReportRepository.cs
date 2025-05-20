// Application/Interfaces/IReportRepository.cs
using Core.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IReportRepository
    {
        Task<IEnumerable<GeneratedReport>> GetAllAsync();
        Task<GeneratedReport?>    GetByIdAsync(int id);
        Task                     DeleteAsync(GeneratedReport report);
       
    }
}