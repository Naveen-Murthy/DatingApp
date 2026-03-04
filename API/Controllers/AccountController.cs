using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(AppDBContext context, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")]

    // To pass values as a query parms
    // public async Task<ActionResult<AppUser>> Register(string email, string displayName, string password){}

    // To pass values as a object
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await EmailExists(registerDto.Email))
        {
            return BadRequest("Email already exists");
        }

        using var hmac = new HMACSHA512();

        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
            PasswordSalt = hmac.Key
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user.ToDto(tokenService);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Email == loginDto.Email);

        if (user == null)
        {
            return Unauthorized("Invalid Email Address");
        }

        using var hmac = new HMACSHA512(user.PasswordSalt);

        var computedPassword = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

        for (var i = 0; i < computedPassword.Length; i++)
        {
            if (computedPassword[i] != user.PasswordHash[i])
            {
                return Unauthorized("Invalid Password");
            }
        }

        return user.ToDto(tokenService);
    }

    public async Task<bool> EmailExists(string email)
    {
        return await context.Users.AnyAsync(x => x.Email.ToLower() == email.ToLower());
    }
}
