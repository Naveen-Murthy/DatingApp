using System;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class LikesController(ILikesRepository likesRepository) : BaseApiController
{
    [HttpPost("{targetMemberID}")]
    public async Task<ActionResult> ToggleLikes(string targetMemberID)
    {
        var sourceMemberID = User.GetMemberId();

        if (sourceMemberID == targetMemberID) return BadRequest("You cannot like yourself");

        var existingLike = await likesRepository.GetMemberLike(sourceMemberID, targetMemberID);

        if (existingLike == null)
        {
            var like = new MemberLike
            {
                SourceMemberId = sourceMemberID,
                TargetMemberId = targetMemberID
            };

            likesRepository.AddLike(like);
        }
        else
        {
            likesRepository.DeleteLike(existingLike);
        }

        if (await likesRepository.SaveAllChanges()) return Ok();

        return BadRequest("Failed to update like");
    }

    [HttpGet("list")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikeIds()
    {
        return Ok(await likesRepository.GetCurrentMemberLikeIds(User.GetMemberId()));
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Member>>> GetMemberLikes([FromQuery] LikesParams likesParams)
    {
        likesParams.MemberId = User.GetMemberId();

        var members = await likesRepository.GetMemberLikes(likesParams);

        return Ok(members);
    }
}
