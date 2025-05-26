using System.Net;
using System.Net.Http.Json;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Startup.Tests.TestUtils;
using Application.Models.Dtos.Surveys;
using Microsoft.EntityFrameworkCore;

namespace Startup.Tests.Surveys;

public class UserSurveysControllerTests : WebApplicationFactory<Program>
{
    private HttpClient _httpClient;
    private IServiceProvider _scopedServiceProvider;

    [SetUp]
    public void Setup()
    {
        _httpClient = CreateClient();
        _scopedServiceProvider = Services.CreateScope().ServiceProvider;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        ApiTestSetupUtilities.ConfigureTestHost(builder);

        builder.ConfigureServices(services =>
        {
            services.DefaultTestConfig();
        });
    }

    [Test]
    public async Task GetActiveSurveys_ReturnsOnlyActiveSurveys()
    {
        // Arrange 
        await ApiTestSetupUtilities.TestRegisterAndAddJwt(_httpClient);
        
        var ctx = _scopedServiceProvider.GetRequiredService<AppDbContext>();

        var admin = MockObjects.GetAdmin();
        ctx.Users.Add(admin);
        
        // Add an active survey
        var activeSurvey = MockObjects.GetSurvey(admin.Id);
        activeSurvey.IsActive = true;
        ctx.Surveys.Add(activeSurvey);
        
        // Add an inactive survey
        var inactiveSurvey = MockObjects.GetSurvey(admin.Id);
        inactiveSurvey.IsActive = false;
        ctx.Surveys.Add(inactiveSurvey);
        
        await ctx.SaveChangesAsync();

        // Act
        var response = await _httpClient.GetAsync("/api/survey-submission/GetActiveSurveys");

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var surveys = await response.Content.ReadFromJsonAsync<List<SurveyResponseDto>>();
        Assert.That(surveys, Is.Not.Null);
        Assert.That(surveys.Count, Is.GreaterThan(0));
        Assert.That(surveys.All(s => s.IsActive), Is.True);
        Assert.That(surveys.Any(s => s.Id == activeSurvey.Id), Is.True);
        Assert.That(surveys.Any(s => s.Id == inactiveSurvey.Id), Is.False);
    }

    [Test]
    public async Task SubmitResponse_Unauthorized_WhenNoJwtProvided()
    {
        // Create a client without an auth header
        var client = CreateClient();

        var submitDto = new SurveySubmissionRequestDto
        {
            SurveyId = Guid.NewGuid().ToString(),
            Responses = new List<QuestionResponseDto>()
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/survey-submission/SubmitResponse", submitDto);

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task SubmitResponse_ReturnsBadRequest_WhenSurveyNotFound()
    {
        // Arrange
        await ApiTestSetupUtilities.TestRegisterAndAddJwt(_httpClient);

        var submitDto = new SurveySubmissionRequestDto
        {
            SurveyId = Guid.NewGuid().ToString(),
            Responses = new List<QuestionResponseDto>
            {
                new()
                {
                    QuestionId = Guid.NewGuid().ToString(),
                    Response = "Answer text"
                }
            }
        };

        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/survey-submission/SubmitResponse", submitDto);

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task SubmitResponse_SuccessfullySubmits_WhenValidRequestProvided()
    {
        // Arrange
        await ApiTestSetupUtilities.TestUserRegisterAndAddJwt(_httpClient);
        
        var ctx = _scopedServiceProvider.GetRequiredService<AppDbContext>();

        var admin = MockObjects.GetAdmin();
        ctx.Users.Add(admin);
        
        // Add an active survey with question
        var survey = MockObjects.GetSurvey(admin.Id);
        ctx.Surveys.Add(survey);
        await ctx.SaveChangesAsync();
        
        var submitDto = new SurveySubmissionRequestDto
        {
            SurveyId = survey.Id,
            Responses = new List<QuestionResponseDto>
            {
                new()
                {
                    QuestionId = survey.Questions.First().Id,
                    Response = "Test answer"
                }
            }
        };

        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/survey-submission/SubmitResponse", submitDto);

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        
        // Verify submission was saved to a database
        var verifyCtx = _scopedServiceProvider.GetRequiredService<AppDbContext>();
        
        var savedResponse = await verifyCtx.SurveyResponses
            .Include(sr => sr.Answers)
            .FirstOrDefaultAsync(sr => sr.SurveyId == survey.Id);
        
        Assert.That(savedResponse, Is.Not.Null);
        Assert.That(savedResponse.Answers.Count, Is.EqualTo(1));
        Assert.That(savedResponse.Answers.First().AnswerText, Is.EqualTo(submitDto.Responses.First().Response));
    }

    [Test]
    public async Task SubmitResponse_ReturnsBadRequest_WhenInvalidAnswers()
    {
        // Arrange
        await ApiTestSetupUtilities.TestRegisterAndAddJwt(_httpClient);

        var ctx = _scopedServiceProvider.GetRequiredService<AppDbContext>();

        var admin = MockObjects.GetAdmin();
        ctx.Users.Add(admin);
        
        var survey = MockObjects.GetSurvey(admin.Id);
        survey.IsActive = true;
        ctx.Surveys.Add(survey);
        
        await ctx.SaveChangesAsync();

        // Submit with non-existing question ID
        var submitDto = new SurveySubmissionRequestDto
        {
            SurveyId = survey.Id,
            Responses = new List<QuestionResponseDto>
            {
                new()
                {
                    QuestionId = Guid.NewGuid().ToString(), // Non-existing question ID
                    Response = "Test answer"
                }
            }
        };

        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/survey-submission/SubmitResponse", submitDto);

        // Assert
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }
}