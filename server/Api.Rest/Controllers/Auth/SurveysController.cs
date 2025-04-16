using Application.Interfaces.Security;
using Microsoft.AspNetCore.Mvc;

[ApiController]
public class SurveysController(ISecurityService securityService) : ControllerBase { }
