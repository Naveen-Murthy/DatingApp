using System;

namespace API.Entities;

public class AppUser
{
    public string ID { get; set; } = Guid.NewGuid().ToString();
    public required string DisplayName { get; set; }
    public required string Email { get; set; }
}
