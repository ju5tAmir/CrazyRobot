using Application.Models;

namespace Application.Interfaces;

public interface IReportService
{
    Task<IEnumerable<GeneratedReportDto>> GetAllAsync();
    Task<GeneratedReportDto?>             GetByIdAsync(int id);
    Task DeleteAsync(int id);
}