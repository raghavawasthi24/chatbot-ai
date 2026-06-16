import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository }      from '../repositories/message.repository';
import { LLMService }              from './llm.service';
import { Conversation, ChatRequest, ChatResponse, LLMMessage, Message } from '../types';
import { config }       from '../config/env';
import { createError }  from '../utils/errors';

export class ChatService {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo:      MessageRepository,
    private readonly llmService:       LLMService,
  ) {}

  // ── Public API ──────────────────────────────────────────────────────────────

  async processMessage(req: ChatRequest): Promise<ChatResponse> {
    const conversation = await this.resolveConversation(req.sessionId);

    // Snapshot history BEFORE persisting the new user message.
    // This prevents the current message from appearing twice in the LLM context.
    const history = await this.messageRepo.findByConversationId(
      conversation.id,
      config.chat.maxHistoryMessages,
    );

    // Persist user message – rolled back on LLM failure to keep
    // the history in a valid alternating-role state.
    const userMsg = await this.messageRepo.create(conversation.id, 'user', req.message);

    const llmMessages = this.buildLLMMessages(history, req.message);

    let reply: string;
    try {
      reply = await this.llmService.generateReply(llmMessages);
    } catch (err) {
      // Best-effort rollback; errors here are swallowed so the original
      // error propagates cleanly to the controller.
      await this.messageRepo.deleteById(userMsg.id).catch(() => undefined);
      throw err;
    }

    await this.messageRepo.create(conversation.id, 'ai', reply);
    await this.conversationRepo.touch(conversation.id);

    return { reply, sessionId: conversation.id };
  }

  async getConversationMessages(
    sessionId: string,
  ): Promise<{ messages: Message[]; sessionId: string }> {
    const conversation = await this.conversationRepo.findById(sessionId);
    if (!conversation) throw createError('Conversation not found.', 404);

    const messages = await this.messageRepo.findByConversationId(sessionId);
    return { messages, sessionId };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async resolveConversation(sessionId?: string): Promise<Conversation> {
    if (sessionId) {
      const existing = await this.conversationRepo.findById(sessionId);
      if (existing) return existing;
    }
    return this.conversationRepo.create();
  }

  /**
   * Converts the persisted history + new user message into the
   * format expected by the Anthropic Messages API.
   *
   * Guarantees:
   *   1. Array starts with a 'user' message  (API requirement).
   *   2. No two consecutive messages share the same role.
   */
  private buildLLMMessages(history: Message[], newUserMessage: string): LLMMessage[] {
    const recent = history.slice(-config.chat.maxHistoryMessages);

    const messages: LLMMessage[] = recent.map((m) => ({
      role:    m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    messages.push({ role: 'user', content: newUserMessage });

    // Enforce alternating roles: if two consecutive messages share a role,
    // merge them (keeps the latest, discards the earlier duplicate).
    const deduped: LLMMessage[] = [];
    for (const msg of messages) {
      if (deduped.length && deduped[deduped.length - 1].role === msg.role) {
        deduped[deduped.length - 1] = msg; // replace with newer
      } else {
        deduped.push(msg);
      }
    }

    // Drop leading assistant messages (array must start with user)
    while (deduped.length && deduped[0].role !== 'user') deduped.shift();

    return deduped;
  }
}
