import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';
import { ChatRequest } from '../types';
import { config } from '../config/env';

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /chat/message
   * Body: { message: string, sessionId?: string }
   */
  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, sessionId } = req.body as ChatRequest;

      // Truncate silently rather than reject
      const safeMessage = message.slice(0, config.chat.maxMessageLength);

      const result = await this.chatService.processMessage({
        message: safeMessage,
        sessionId,
      });

      res.status(200).json(result);
    } catch (err) {

      console.log('error', err);
      next(err);
    }
  };

  /**
   * GET /chat/history/:sessionId
   */
  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const result = await this.chatService.getConversationMessages(sessionId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
