using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class MembersController(AppDBContext context) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMemberss()
        {
            var members = await context.Users.ToListAsync();

            return members;
        }

        [HttpGet("{ID}")]
        public async Task<ActionResult<AppUser>> GetMember(string id)
        {
            var member = await context.Users.FindAsync(id);

            if (member == null)
            {
                return NotFound();
            }

            return member;
        }
    }
}
