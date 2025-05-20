using Application.Interfaces;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using Infrastructure.Postgres.Scaffolding;

namespace Infrastructure.Postgres
{
    public class ReportRepository : IReportRepository
    {
        private readonly AppDbContext _ctx;
        public ReportRepository(AppDbContext ctx) => _ctx = ctx;

        public async Task<IEnumerable<GeneratedReport>> GetAllAsync() =>
            await _ctx.GeneratedReports.AsNoTracking().ToListAsync();

        public async Task<GeneratedReport?> GetByIdAsync(int id) =>
            await _ctx.GeneratedReports.FindAsync(id);

        public async Task DeleteAsync(GeneratedReport report)
        {
            _ctx.GeneratedReports.Remove(report);
            await _ctx.SaveChangesAsync();
        }
    }
}