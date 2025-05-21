// Api.Rest/Controllers/GeneratedReportsController.cs
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Application.Models;

namespace Api.Rest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeneratedReportsController : ControllerBase
    {
        private readonly IReportService _service;

        public GeneratedReportsController(IReportService service)
        {
            _service = service;
        }

        // GET api/GeneratedReports
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GeneratedReportDto>>> GetAll()
        {
            var dtos = await _service.GetAllAsync();
            return Ok(dtos);
        }

        // GET api/GeneratedReports/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<GeneratedReportDto>> Get(int id)
        {
            var dto = await _service.GetByIdAsync(id);
            if (dto is null) return NotFound();
            return Ok(dto);
        }

        // DELETE api/GeneratedReports/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}