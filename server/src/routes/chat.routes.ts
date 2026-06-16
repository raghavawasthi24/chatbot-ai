import { Router } from 'express';
import { Pool }   from 'pg';

import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository }      from '../repositories/message.repository';
import { LLMService }              from '../services/llm.service';
import { ChatService }             from '../services/chat.service';
import { ChatController }          from '../controllers/chat.controller';

import {
  validateSendMessage,
  validateSessionId,
} from '../middleware/validation.middleware';

/**
 * Factory that creates a fully-wired chat router.
 * Dependency graph is assembled here so each layer stays free of
 * concrete dependencies and is trivially unit-testable.
 */
export const createChatRouter = (pool: Pool): Router => {
  const router = Router();

  // ── Dependency injection ──────────────────────────────────────────────────
  const conversationRepo = new ConversationRepository(pool);
  const messageRepo      = new MessageRepository(pool);
  const llmService       = new LLMService();
  const chatService      = new ChatService(conversationRepo, messageRepo, llmService);
  const controller       = new ChatController(chatService);

  // ── Routes ────────────────────────────────────────────────────────────────
  /**
   * POST /chat/message
   * { message: string, sessionId?: string } → { reply, sessionId }
   */
  router.post('/message', validateSendMessage, controller.sendMessage);

  /**
   * GET /chat/history/:sessionId
   * → { messages: Message[], sessionId }
   */
  router.get('/history/:sessionId', validateSessionId, controller.getHistory);

  return router;
};
