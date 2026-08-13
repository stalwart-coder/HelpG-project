/**
 * Unit tests for Chat Service.
 */
import * as chatService from '../../services/chatService.js';
import { createUser, createConversation, createMessage } from '../fixtures/factories.js';

describe('Chat Service', () => {
  describe('getOrCreateConversation', () => {
    it('should create a new conversation between two users', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000002', email: 'user2@example.com' });
      const conv = await chatService.getOrCreateConversation(
        user1._id.toString(),
        user2._id.toString()
      );
      expect(conv).toBeDefined();
      expect(conv.participants).toHaveLength(2);
    });

    it('should return existing conversation instead of creating duplicate', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000003', email: 'user3@example.com' });
      const conv1 = await chatService.getOrCreateConversation(
        user1._id.toString(),
        user2._id.toString()
      );
      const conv2 = await chatService.getOrCreateConversation(
        user1._id.toString(),
        user2._id.toString()
      );
      expect(conv1._id.toString()).toBe(conv2._id.toString());
    });

    it('should create booking-specific conversation', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000004', email: 'user4@example.com' });
      const bookingId = new (await import('mongoose')).Types.ObjectId().toString();
      const conv = await chatService.getOrCreateConversation(
        user1._id.toString(),
        user2._id.toString(),
        bookingId
      );
      expect(conv.bookingId.toString()).toBe(bookingId);
    });
  });

  describe('sendMessage', () => {
    it('should send a message in a conversation', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000005', email: 'user5@example.com' });
      const conv = await createConversation({ user1, user2 });
      const msg = await chatService.sendMessage(
        conv._id.toString(),
        user1._id.toString(),
        'Hello, how are you?'
      );
      expect(msg).toBeDefined();
      expect(msg.content).toBe('Hello, how are you?');
    });

    it('should throw if sender is not a participant', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000006', email: 'user6@example.com' });
      const stranger = await createUser({ phone: '+919000000007', email: 'stranger@example.com' });
      const conv = await createConversation({ user1, user2 });
      await expect(
        chatService.sendMessage(conv._id.toString(), stranger._id.toString(), 'Hi')
      ).rejects.toThrow('not a participant');
    });

    it('should update conversation lastMessage', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000008', email: 'user8@example.com' });
      const conv = await createConversation({ user1, user2 });
      await chatService.sendMessage(conv._id.toString(), user1._id.toString(), 'Last message test');
      const updated = await (await import('../../models/Conversation.js')).default.findById(conv._id);
      expect(updated.lastMessage.content).toBe('Last message test');
    });
  });

  describe('getMessages', () => {
    it('should return messages for a conversation', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000009', email: 'user9@example.com' });
      const conv = await createConversation({ user1, user2 });
      await createMessage({ conversation: conv, sender: user1._id });
      await createMessage({ conversation: conv, sender: user2._id, content: 'Response message' });

      const result = await chatService.getMessages(conv._id.toString(), user1._id.toString(), {});
      expect(result.messages).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should throw if user is not a participant', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000010', email: 'user10@example.com' });
      const stranger = await createUser({ phone: '+919000000011', email: 'stranger2@example.com' });
      const conv = await createConversation({ user1, user2 });
      await expect(
        chatService.getMessages(conv._id.toString(), stranger._id.toString(), {})
      ).rejects.toThrow('do not have access');
    });
  });

  describe('getUserConversations', () => {
    it('should return all conversations for a user', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000012', email: 'user12@example.com' });
      const user3 = await createUser({ phone: '+919000000013', email: 'user13@example.com' });
      await createConversation({ user1, user2 });
      await createConversation({ user1, user3 });

      const conversations = await chatService.getUserConversations(user1._id.toString());
      expect(conversations).toHaveLength(2);
    });

    it('should return empty array if no conversations', async () => {
      const user = await createUser();
      const conversations = await chatService.getUserConversations(user._id.toString());
      expect(conversations).toHaveLength(0);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark unread messages as read', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000014', email: 'user14@example.com' });
      const conv = await createConversation({ user1, user2 });
      await createMessage({ conversation: conv, sender: user1._id });
      await createMessage({ conversation: conv, sender: user1._id, content: 'Second msg' });

      const result = await chatService.markMessagesAsRead(conv._id.toString(), user2._id.toString());
      expect(result.modifiedCount).toBe(2);
    });
  });

  describe('getTotalUnreadCount', () => {
    it('should return total unread count', async () => {
      const user1 = await createUser();
      const user2 = await createUser({ phone: '+919000000015', email: 'user15@example.com' });
      const conv = await createConversation({ user1, user2 });
      await createMessage({ conversation: conv, sender: user1._id });
      await createMessage({ conversation: conv, sender: user1._id, content: 'Another' });

      const count = await chatService.getTotalUnreadCount(user2._id.toString());
      expect(count).toBe(2);
    });
  });
});
