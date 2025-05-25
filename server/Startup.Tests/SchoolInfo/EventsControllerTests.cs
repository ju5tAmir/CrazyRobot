 
using System.Net;
using System.Net.Http.Json;
using Application.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using NUnit.Framework;
using Startup.Tests.TestUtils;

namespace Startup.Tests.SchoolInfo
{
    public class EventsControllerTests
    {
        private HttpClient _client;

        [SetUp]
        public void Setup()
        {
            var factory = new WebApplicationFactory<Program>()
                .WithWebHostBuilder(builder =>
                {
                    ApiTestSetupUtilities.ConfigureTestHost(builder);
                    builder.ConfigureServices(services => services.DefaultTestConfig());
                });

            _client = factory.CreateClient();
        }

        [TearDown]
        public void TearDown() => _client.Dispose();

        [Test]
        public async Task GetAll_ReturnsOkAndList()
        {
            var res = await _client.GetAsync("/api/events");
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            var list = await res.Content.ReadFromJsonAsync<IEnumerable<EventDto>>();
            Assert.That(list, Is.Not.Null);
        }

        [Test]
        public async Task GetById_ReturnsNotFound_WhenMissing()
        {
            var res = await _client.GetAsync($"/api/events/{Guid.NewGuid()}");
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
        }

        [Test]
        public async Task Create_ReturnsCreated()
        {
            var dto = new EventDto
            {
                Title = "E1",
                Description = "D",
                Date = DateOnly.FromDateTime(DateTime.UtcNow),
                Time = "12:00",
                Location = "Here",
                Category = "Cat"
            };

            var res = await _client.PostAsJsonAsync("/api/events", dto);
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.Created));
            Assert.That(res.Headers.Location, Is.Not.Null);
        }

        [Test]
        public async Task Update_ReturnsNoContent_WhenIdMatches()
        {
            var dto = new EventDto
            {
                Title = "E1",
                Description = "D",
                Date = DateOnly.FromDateTime(DateTime.UtcNow),
                Time = "12:00",
                Location = "Here",
                Category = "Cat"
            };
            var create = await _client.PostAsJsonAsync("/api/events", dto);
            var id = create.Headers.Location!.Segments.Last();
            dto.Id = id;
            dto.Title = "Updated";

            var res = await _client.PutAsJsonAsync($"/api/events/{id}", dto);
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));
        }

        [Test]
        public async Task Update_ReturnsBadRequest_WhenIdMismatch()
        {
            var dto = new EventDto { Id = "X", Title = "T", Description = "D", Date = DateOnly.MinValue, Time = "T", Location = "L", Category = "C" };
            var res = await _client.PutAsJsonAsync($"/api/events/{Guid.NewGuid()}", dto);
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
        }

        [Test]
        public async Task Delete_ReturnsNoContent()
        {
            var dto = new EventDto
            {
                Title = "E1",
                Description = "D",
                Date = DateOnly.FromDateTime(DateTime.UtcNow),
                Time = "12:00",
                Location = "Here",
                Category = "Cat"
            };
            var create = await _client.PostAsJsonAsync("/api/events", dto);
            var id = create.Headers.Location!.Segments.Last();

            var res = await _client.DeleteAsync($"/api/events/{id}");
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));
        }
    }
}
