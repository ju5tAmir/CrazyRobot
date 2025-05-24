using System.Net;
using System.Net.Http.Json;
using Application.Models;
using Google.Cloud.Storage.V1;
using Infrastructure.Postgres.Scaffolding;  
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using NUnit.Framework;
using Startup.Tests.TestUtils;

namespace Startup.Tests.SchoolInfo
{
    [TestFixture]
    public class ContactsControllerTests
    {
        private WebApplicationFactory<Program> _factory;
        private HttpClient _client;
        private Mock<StorageClient> _storageMock;

        [SetUp]
        public void Setup()
        {
            _storageMock = new Mock<StorageClient>();

            _factory = new WebApplicationFactory<Program>()
                .WithWebHostBuilder(builder =>
                {
                    ApiTestSetupUtilities.ConfigureTestHost(builder);
                    builder.ConfigureServices(services =>
                    {
                        services.DefaultTestConfig();
                        services.AddSingleton(_storageMock.Object);
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
        public async Task GetAll_ReturnsSeededContacts()
        {
            // Arrange 
            using (var scope = _factory.Services.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                ctx.Contacts.AddRange(new[]
                {
                    new Core.Domain.Entities.SchoolContact() { Id = Guid.NewGuid().ToString(), Name = "A", Role="R", Department="D", Email="a@example.com", Phone="1" },
                    new Core.Domain.Entities.SchoolContact() { Id = Guid.NewGuid().ToString(), Name = "B", Role="R", Department="D", Email="b@example.com", Phone="2" }
                });
                await ctx.SaveChangesAsync();
            }

            // Act
            var res = await _client.GetAsync("/api/contacts");

            // Assert
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            var list = await res.Content.ReadFromJsonAsync<IEnumerable<ContactDto>>();
            Assert.That(list!.Count(), Is.GreaterThanOrEqualTo(2));
            Assert.That(list.Select(c => c.Email), Contains.Item("a@example.com"));
            Assert.That(list.Select(c => c.Email), Contains.Item("b@example.com"));
        }

        [Test]
        public async Task GetById_ReturnsSeededContact()
        {
            string seededId;
            // Arrange 
            using (var scope = _factory.Services.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var entity = new Core.Domain.Entities.SchoolContact()
                {
                    Id         = Guid.NewGuid().ToString(),
                    Name       = "Seed",
                    Role       = "R",
                    Department = "D",
                    Email      = "seed@example.com",
                    Phone      = "9"
                };
                ctx.Contacts.Add(entity);
                await ctx.SaveChangesAsync();
                seededId = entity.Id;
            }

            // Act
            var res = await _client.GetAsync($"/api/contacts/{seededId}");

            // Assert
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            var dto = await res.Content.ReadFromJsonAsync<ContactDto>();
            Assert.That(dto!.Id, Is.EqualTo(seededId));
            Assert.That(dto.Email, Is.EqualTo("seed@example.com"));
        }

        [Test]
        public async Task Create_CreatesContact_InDatabase()
        {
            // Arrange
            var dto = new ContactDto
            {
                Name       = "New",
                Role       = "R",
                Department = "D",
                Email      = "new@example.com",
                Phone      = "5"
            };

            // Act
            var res = await _client.PostAsJsonAsync("/api/contacts", dto);

            // Assert HTTP
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.Created));
            var id = res.Headers.Location!.Segments.Last();

            // Assert DB
            using (var scope = _factory.Services.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var saved = await ctx.Contacts.FindAsync(id);
                Assert.That(saved, Is.Not.Null);
                Assert.That(saved!.Email, Is.EqualTo("new@example.com"));
            }
        }

        [Test]
        public async Task Update_SeedAndUpdate_ThenVerifyInDb()
        {
            string seededId;
            // Arrange: seed
            using (var scope = _factory.Services.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var entity = new Core.Domain.Entities.SchoolContact()
                {
                    Id         = Guid.NewGuid().ToString(),
                    Name       = "Orig",
                    Role       = "R",
                    Department = "D",
                    Email      = "orig@example.com",
                    Phone      = "0"
                };
                ctx.Contacts.Add(entity);
                await ctx.SaveChangesAsync();
                seededId = entity.Id;
            }

            // Act 
            var updateDto = new ContactDto
            {
                Id         = seededId,
                Name       = "Changed",
                Role       = "R",
                Department = "D",
                Email      = "orig@example.com",
                Phone      = "7"
            };
            var res = await _client.PutAsJsonAsync($"/api/contacts/{seededId}", updateDto);

            // Assert HTTP
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

            // Assert DB
            using (var scope = _factory.Services.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var updated = await ctx.Contacts.FindAsync(seededId);
                Assert.That(updated!.Name, Is.EqualTo("Changed"));
                Assert.That(updated.Phone, Is.EqualTo("7"));
            }
        }

        [Test]
        public async Task Delete_SeedAndDelete_VerifyGoneInDb()
        {
            string seededId;
            // Arrange: seed
            using (var scope = _factory.Services.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var entity = new Core.Domain.Entities.SchoolContact()
                {
                    Id         = Guid.NewGuid().ToString(),
                    Name       = "ToDel",
                    Role       = "R",
                    Department = "D",
                    Email      = "del@x.com",
                    Phone      = "8"
                };
                ctx.Contacts.Add(entity);
                await ctx.SaveChangesAsync();
                seededId = entity.Id;
            }

            // Act
            var res = await _client.DeleteAsync($"/api/contacts/{seededId}");

            // Assert HTTP
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

            // Assert DB
            using (var scope = _factory.Services.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var deleted = await ctx.Contacts.FindAsync(seededId);
                Assert.That(deleted, Is.Null);
            }
        }

        [Test]
        public async Task UploadPhoto_ReturnsBadRequest_WhenNoFile()
        {
            var res = await _client.PostAsync("/api/contacts/upload", new MultipartFormDataContent());
            Assert.That(res.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
        }

         
    }
}
