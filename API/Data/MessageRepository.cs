using System;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MessageRepository(AppDBContext context) : IMessageRepository
{
    public void AddMessage(Message message)
    {
        context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        context.Messages.Remove(message);
    }

    public async Task<Message?> GetMessage(string messageId)
    {
        return await context.Messages.FindAsync(messageId);
    }

    public async Task<PaginatedResult<MessageDto>> GetMessagesForMember(MessageParams messageParams)
    {
        var query = context.Messages
            .OrderByDescending(m => m.MessageSent)
            .AsQueryable();

        query = messageParams.Container switch
        {
            "Outbox" => query.Where(m => m.SenderId == messageParams.MemberId && !m.SenderDeleted),
            _ => query.Where(m => m.RecipientId == messageParams.MemberId && !m.RecipientDeleted)
        };

        // var messagesQuery = query.Select(m => new MessageDto
        // {
        //     Id = m.Id,
        //     SenderId = m.SenderId,
        //     SenderDisplayName = m.Sender.DisplayName,
        //     RecipientId = m.RecipientId,
        //     RecipientDisplayName = m.Recipient.DisplayName,
        //     Content = m.Content,
        //     DateRead = m.DateRead,
        //     MessageSent = m.MessageSent
        // });
        /// We can use the above code to project the Message entity to MessageDto, but it will be more efficient to use the ToDtoProjection method in the MessageExtentions class, which will allow us to use the same projection for both GetMessagesForMember and GetMessageThread methods.
        var messagesQuery = query.Select(MessageExtentions.ToDtoProjection());

        return await PaginationHelper.CreateAsync(messagesQuery, messageParams.PageNumber, messageParams.PageSize);
    }

    public async Task<IReadOnlyList<MessageDto>> GetMessageThread(string currentMemberId, string recipientId)
    {
        await context.Messages
        .Where(m => m.RecipientId == currentMemberId && m.SenderId == recipientId && m.DateRead == null)
        .ExecuteUpdateAsync(setters => setters.SetProperty(m => m.DateRead, DateTime.UtcNow));

        return await context.Messages
            .Where(m => (m.RecipientId == currentMemberId && !m.SenderDeleted && m.SenderId == recipientId) ||
                        (m.RecipientId == recipientId && !m.RecipientDeleted && m.SenderId == currentMemberId))
            .OrderBy(m => m.MessageSent)
            .Select(MessageExtentions.ToDtoProjection())
            .ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }
}
