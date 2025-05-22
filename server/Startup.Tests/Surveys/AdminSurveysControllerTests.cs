using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using NUnit.Framework;
using Startup.Tests.TestUtils;
using AuthUserRequest = Generated.AuthUserRequest;
using CreateSurveyRequestDto = Application.Models.Dtos.Surveys.CreateSurveyRequestDto;
using QuestionDto = Application.Models.Dtos.Surveys.QuestionDto;
using QuestionOptionDto = Application.Models.Dtos.Surveys.QuestionOptionDto;
using QuestionResponseDto = Application.Models.Dtos.Surveys.QuestionResponseDto;
using SurveyResponseDto = Application.Models.Dtos.Surveys.SurveyResponseDto;
using SurveyResultsDto = Application.Models.Dtos.Surveys.SurveyResultsDto;
using SurveySubmissionRequestDto = Application.Models.Dtos.Surveys.SurveySubmissionRequestDto;
using UpdateSurveyRequestDto = Application.Models.Dtos.Surveys.UpdateSurveyRequestDto;

namespace Startup.Tests.Surveys;

public class AdminSurveysControllerTests
{
    private HttpClient _httpClient;
    private IServiceProvider _scopedServiceProvider;
    private string _jwtToken;

    [SetUp]
    public async Task Setup()
    {
        var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                ApiTestSetupUtilities.ConfigureTestHost(builder);
                builder.ConfigureServices(services => { services.DefaultTestConfig(); });
            });

        _httpClient = factory.CreateClient();
        _scopedServiceProvider = factory.Services.CreateScope().ServiceProvider;
    }
    
    [TearDown]
    public void TearDown()
    {
        _httpClient?.Dispose();
    }

    [Test]
    public async Task GetAllSurveys_Unauthorized_WhenNoJwtProvided()
    {
        // Create a client without auth header
        var client = _httpClient;
        
        // Act
        var response = await client.GetAsync("/api/surveys/GetAllSurveys");
        
        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    [Test]
    public async Task GetAllSurveys_ReturnsAllSurveys()
    {
        // Act
        await ApiTestSetupUtilities.TestRegisterAndAddJwt(_httpClient);
        var response = await _httpClient.GetAsync("/api/surveys/GetAllSurveys");
    
        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var surveys = await response.Content.ReadFromJsonAsync<List<SurveyResponseDto>>();
        Assert.That(surveys, Is.Not.Null);
    }

    [Test]
    public async Task CreateSurvey_ReturnsBadRequest_WhenInvalidRequest()
    {
        // Arrange - Missing required fields
        var createDto = new CreateSurveyRequestDto
        {
            // Title is missing
            Description = "Survey Description",
            SurveyType = "Feedback",
            IsActive = true,
            Questions = new List<QuestionDto>()
        };
        
        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/surveys/CreateSurvey", createDto);
        
        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task UpdateSurvey_UpdatesSurvey_WhenExists()
    {
        // Arrange - Create a survey first
        var createDto = new CreateSurveyRequestDto
        {
            Title = "Original Survey",
            Description = "Original Description",
            SurveyType = "Feedback",
            IsActive = true,
            Questions = new List<QuestionDto>
            {
                new()
                {
                    QuestionText = "Original Question",
                    QuestionType = "Text",
                    OrderNumber = 1,
                    Options = new List<QuestionOptionDto>()
                }
            }
        };

        var createResponse = await _httpClient.PostAsJsonAsync("/api/surveys/CreateSurvey", createDto);
        var createdSurvey = await createResponse.Content.ReadFromJsonAsync<SurveyResponseDto>();
        
        // Update the survey
        var updateDto = new UpdateSurveyRequestDto
        {
            Id = createdSurvey.Id,
            Title = "Updated Survey",
            Description = "Updated Description",
            SurveyType = "Feedback",
            IsActive = false,
            Questions = new List<QuestionDto>
            {
                new()
                {
                    Id = createdSurvey.Questions.First().Id,
                    QuestionText = "Updated Question",
                    QuestionType = "Text",
                    OrderNumber = 1,
                    Options = new List<QuestionOptionDto>()
                }
            }
        };
        
        // Act
        var response = await _httpClient.PutAsJsonAsync($"/api/surveys/UpdateSurvey/{createdSurvey.Id}", updateDto);
        
        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var updatedSurvey = await response.Content.ReadFromJsonAsync<SurveyResponseDto>();
        Assert.That(updatedSurvey, Is.Not.Null);
        Assert.That(updatedSurvey.Title, Is.EqualTo("Updated Survey"));
        Assert.That(updatedSurvey.Description, Is.EqualTo("Updated Description"));
        Assert.That(updatedSurvey.IsActive, Is.False);
    }

    [Test]
    public async Task UpdateSurvey_ReturnsNotFound_WhenSurveyDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid().ToString();
        var updateDto = new UpdateSurveyRequestDto
        {
            Id = nonExistentId,
            Title = "Updated Survey",
            Description = "Updated Description",
            SurveyType = "Feedback",
            IsActive = true,
            Questions = new List<QuestionDto>()
        };
        
        // Act
        var response = await _httpClient.PutAsJsonAsync($"/api/surveys/UpdateSurvey/{nonExistentId}", updateDto);
        
        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task DeleteSurvey_DeletesSurvey_WhenExists()
    {
        // Act - First register and authenticate properly
        await ApiTestSetupUtilities.TestRegisterAndAddJwt(_httpClient);

        // Create a survey
        var createDto = new CreateSurveyRequestDto
        {
            Title = "Survey to Delete",
            Description = "This will be deleted",
            SurveyType = "Feedback",
            IsActive = true,
            Questions = new List<QuestionDto>
            {
                new()
                {
                    QuestionText = "Test Question",
                    QuestionType = "SingleChoice",
                    Options = new List<QuestionOptionDto>
                    {
                        new() { OptionText = "Option 1" },
                        new() { OptionText = "Option 2" }
                    }
                }
            }
        };

        var createResponse = await _httpClient.PostAsJsonAsync("/api/surveys/CreateSurvey", createDto);
        createResponse.EnsureSuccessStatusCode();
        var createdSurvey = await createResponse.Content.ReadFromJsonAsync<SurveyResponseDto>();
    
        // Act
        var response = await _httpClient.DeleteAsync($"/api/surveys/DeleteSurvey/{createdSurvey.Id}");
    
        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    
        // Verify it's deleted using GetAllSurveys
        var getAllResponse = await _httpClient.GetAsync("/api/surveys/GetAllSurveys");
        var allSurveys = await getAllResponse.Content.ReadFromJsonAsync<List<SurveyResponseDto>>();
        Assert.That(allSurveys.Any(s => s.Id == createdSurvey.Id), Is.False);
    }

    [Test]
    public async Task DeleteSurvey_ReturnsNotFound_WhenSurveyDoesNotExist()
    {
        // Act
        var response = await _httpClient.DeleteAsync($"/api/surveys/DeleteSurvey/{Guid.NewGuid()}");
        
        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }
    
    [Test]
    public async Task GetSurveyResults_ReturnsSurveyResults_WhenSurveyExists()
    {
        // Arrange - Create a survey with submissions first
        var createDto = new CreateSurveyRequestDto
        {
            Title = "Results Survey",
            Description = "Survey for testing results",
            SurveyType = "Feedback",
            IsActive = true,
            Questions = new List<QuestionDto>
            {
                new()
                {
                    QuestionText = "How satisfied are you?",
                    QuestionType = "Rating",
                    OrderNumber = 1,
                    Options = new List<QuestionOptionDto>
                    {
                        new() { OptionText = "1", OrderNumber = 1 },
                        new() { OptionText = "2", OrderNumber = 2 },
                        new() { OptionText = "3", OrderNumber = 3 }
                    }
                }
            }
        };

        var createResponse = await _httpClient.PostAsJsonAsync("/api/surveys/CreateSurvey", createDto);
        var createdSurvey = await createResponse.Content.ReadFromJsonAsync<SurveyResponseDto>();
        
        // Submit a response to this survey 
        var submissionDto = new SurveySubmissionRequestDto
        {
            SurveyId = createdSurvey.Id,
            Responses = new List<QuestionResponseDto>
            {
                new()
                {
                    QuestionId = createdSurvey.Questions.First().Id,
                    OptionId = createdSurvey.Questions.First().Options.First().Id
                }
            }
        };
        
        await _httpClient.PostAsJsonAsync("/api/survey-submission/SubmitResponse", submissionDto);
        
        // Act
        var response = await _httpClient.GetAsync($"/api/surveys/GetSurveysResults");
        
        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var results = await response.Content.ReadFromJsonAsync<SurveyResultsDto>();
        Assert.That(results, Is.Not.Null);
        Assert.That(results.SurveyId, Is.EqualTo(createdSurvey.Id));
    }
    
    // Add this helper method to your test class if it doesn't exist
    private string GenerateJwtToken(AuthUserRequest user)
    {
        // This should match your application's JWT generation logic
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("test-jwt-secret-for-testing-purposes-only");
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("Id", Guid.NewGuid().ToString()),
                new Claim("Email", user.Email),
                new Claim("Username", user.Username),
                new Claim("Role", user.Role)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
    
}