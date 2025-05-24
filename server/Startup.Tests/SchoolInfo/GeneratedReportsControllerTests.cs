 
using System.Net;
using System.Net.Http.Json;
using Application.Models;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Startup.Tests.TestUtils;

namespace Startup.Tests.SchoolInfo
{
    public class GeneratedReportsControllerTests
    {
        private WebApplicationFactory<Program> _factory;
        private HttpClient _client;

        [SetUp]
        public void Setup()
        {
            _factory = new WebApplicationFactory<Program>()
                .WithWebHostBuilder(builder =>
                {
                    ApiTestSetupUtilities.ConfigureTestHost(builder);
                    builder.ConfigureServices(services =>
                    {
                        services.DefaultTestConfig();
                        
                    });
                });

            _client = _factory.CreateClient();
        }

        [TearDown]
        public void TearDown()
        {
            _client.Dispose();
            _factory.Dispose();
        }

        [Test]
        public async Task GetAll_ReturnsOkAndList()
        {
            var res = await _client.GetAsync("/api/GeneratedReports");
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            var list = await res.Content.ReadFromJsonAsync<IEnumerable<GeneratedReportDto>>();
            Assert.That(list, Is.Not.Null);
        }

        [Test]
        public async Task GetById_ReturnsNotFound_WhenMissing()
        {
            var randomId = new Random().Next(1000, 2000);
            var res = await _client.GetAsync($"/api/GeneratedReports/{randomId}");
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
        }

        [Test]
        public async Task Delete_ReturnsNoContent()
        {
            // 1. Seed  
            int seededId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                // Create a new GeneratedReport and save it to the database
                var report = new GeneratedReport
                {
                    SurveyId = "survey-123",
                    GeneratedAt = DateTime.UtcNow,
                    ReportText = "Test report"
                };
                db.GeneratedReports.Add(report);
                await db.SaveChangesAsync();
                seededId = report.Id;
            }

             
            var delResponse = await _client.DeleteAsync($"/api/GeneratedReports/{seededId}");
            Assert.That(delResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

            // 2. Check that it was deleted 
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var exists = await db.GeneratedReports.AnyAsync(r => r.Id == seededId);
                Assert.That(exists, Is.False);
            }
        }
    }
}
