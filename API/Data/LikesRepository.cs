using System;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class LikesRepository(AppDBContext context) : ILikesRepository
{
    public void AddLike(MemberLike like)
    {
        context.Likes.Add(like);
    }

    public void DeleteLike(MemberLike like)
    {
        context.Likes.Remove(like);
    }

    public async Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId)
    {
        return await context.Likes
        .Where(like => like.SourceMemberId == memberId) // Current User ID as Source ID
        .Select(like => like.TargetMemberId) // After getting the list we need only TargetIds so we are selecting only targetIds
        .ToListAsync();
    }

    public async Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId)
    {
        return await context.Likes.FindAsync(sourceMemberId, targetMemberId);
    }

    public async Task<PaginatedResult<Member>> GetMemberLikes(LikesParams likesParams)
    {
        // Start with the Likes table
        var query = context.Likes.AsQueryable();
        IQueryable<Member> result;

        switch (likesParams.Predicate)
        {
            case "liked":
                result = query
                    .Where(like => like.SourceMemberId == likesParams.MemberId)
                    .Select(like => like.TargetMember);
                break;
            case "likedBy":
                result = query
                    .Where(like => like.TargetMemberId == likesParams.MemberId)
                    .Select(like => like.SourceMember);
                break;
            default: // Mutual Case
                var likeIDs = await GetCurrentMemberLikeIds(likesParams.MemberId);
                result = query
                    .Where(like => like.TargetMemberId == likesParams.MemberId && likeIDs.Contains(like.SourceMemberId))
                    .Select(like => like.SourceMember);
                break;
        }

        return await PaginationHelper.CreateAsync(result, likesParams.PageNumber, likesParams.PageSize);
    }

    public async Task<bool> SaveAllChanges()
    {
        return await context.SaveChangesAsync() > 0;
    }
}
