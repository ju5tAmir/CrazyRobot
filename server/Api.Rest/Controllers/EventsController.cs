using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Interfaces;
using Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class EventsController : ControllerBase
    {
        private readonly IEventService _svc;
        public EventsController(IEventService svc) => _svc = svc;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetAll() =>
            Ok(await _svc.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> Get(string id)
        {
            var dto = await _svc.GetByIdAsync(id);
            return dto == null ? NotFound() : Ok(dto);
        }

        [HttpPost]
        
        public async Task<IActionResult> Create([FromBody] EventDto dto)
        {
            var id = await _svc.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id }, null);
        }

        [HttpPut("{id}")]
        
        public async Task<IActionResult> Update(string id, [FromBody] EventDto dto)
        {
            if (id != dto.Id) return BadRequest("Id mismatch");
            await _svc.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        
        public async Task<IActionResult> Delete(string id)
        {
            await _svc.DeleteAsync(id);
            return NoContent();
        }
    }
}