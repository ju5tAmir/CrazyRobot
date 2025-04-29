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
    
    public class ContactsController : ControllerBase
    {
        private readonly IContactService _svc;
        public ContactsController(IContactService svc) => _svc = svc;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactDto>>> GetAll() =>
            Ok(await _svc.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<ContactDto>> Get(string id)
        {
            var dto = await _svc.GetByIdAsync(id);
            return dto == null ? NotFound() : Ok(dto);
        }

        [HttpPost]
        
        public async Task<IActionResult> Create([FromBody] ContactDto dto)
        {
            var id = await _svc.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id }, null);
        }

        [HttpPut("{id}")]
       
        public async Task<IActionResult> Update(string id, [FromBody] ContactDto dto)
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