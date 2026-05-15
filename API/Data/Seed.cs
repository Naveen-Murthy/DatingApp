using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
    public static async Task SeedUsers(UserManager<AppUser> userManager)
    {
        if (await userManager.Users.AnyAsync()) return;

        Console.WriteLine("Seeding Data...");
        var memberData = await File.ReadAllTextAsync("Data/UserSeedData.json");
        var members = JsonSerializer.Deserialize<List<SeedUserDto>>(memberData);

        if (members == null)
        {
            Console.WriteLine("No members in Seed data");
            return;
        }


        foreach (var member in members)
        {
            var user = new AppUser
            {
                Id = member.Id,
                Email = member.Email,
                UserName = member.Email,
                DisplayName = member.DisplayName,
                ImageUrl = member.ImageUrl,
                Member = new Member
                {
                    Id = member.Id,
                    DisplayName = member.DisplayName,
                    Description = member.Description,
                    DateofBirth = member.DateofBirth,
                    ImageUrl = member.ImageUrl,
                    Gender = member.Gender,
                    City = member.City,
                    Country = member.Country,
                    Created = member.Created,
                    LastActive = member.LastActive,
                }
            };

            user.Member.Photos.Add(new Photo
            {
                Url = member.ImageUrl!,
                MemberId = member.Id,
            });

            var result = await userManager.CreateAsync(user, "Pa$$w0rd");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "Member");
            }
            else
            {
                Console.WriteLine(result.Errors.First().Description);
            }

        }

        var admin = new AppUser
        {
            UserName = "admin@test.com",
            Email = "admin@test.com",
            DisplayName = "Admin"
        };

        var adminResult = await userManager.CreateAsync(admin, "Pa$$w0rd");
        if (adminResult.Succeeded)
        {
            await userManager.AddToRolesAsync(admin, new[] { "Admin", "Moderator" });
        }
        else
        {
            Console.WriteLine(adminResult.Errors.First().Description);
        }
    }
}