// Application/Services/ReportService.cs
using Application.Interfaces;
using Application.Models;

namespace Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _repo;

        public ReportService(IReportRepository repo) => _repo = repo;

        public async Task<IEnumerable<GeneratedReportDto>> GetAllAsync()
        {
            var entities = await _repo.GetAllAsync();
            return entities
                .OrderByDescending(r => r.GeneratedAt)
                .Select(r => new GeneratedReportDto {
                    Id          = r.Id,
                    SurveyId    = r.SurveyId,
                    GeneratedAt = r.GeneratedAt,
                    ReportText  = r.ReportText
                });
        }

        public async Task<GeneratedReportDto?> GetByIdAsync(int id)
        {
            var r = await _repo.GetByIdAsync(id);
            if (r is null) return null;
            return new GeneratedReportDto {
                Id          = r.Id,
                SurveyId    = r.SurveyId,
                GeneratedAt = r.GeneratedAt,
                ReportText  = r.ReportText
            };
        }

        public async Task DeleteAsync(int id)
        {
            var r = await _repo.GetByIdAsync(id);
            if (r is null) return;
            await _repo.DeleteAsync(r);
        }
    }
}