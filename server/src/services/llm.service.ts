import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GoogleGenerativeAIError,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIAbortError,
  GoogleGenerativeAIResponseError,
  type Content,
} from '@google/generative-ai';
import { config }              from '../config/env';
import { STORE_SYSTEM_PROMPT } from '../constants/storeKnowledge';
import { LLMMessage }          from '../types';
import { createError }         from '../utils/errors';

/** Anthropic uses 'assistant'; Gemini uses 'model'. */
const toGeminiRole = (role: 'user' | 'assistant'): 'user' | 'model' =>
  role === 'user' ? 'user' : 'model';

export class LLMService {
  private readonly genai: GoogleGenerativeAI;

  constructor() {
    this.genai = new GoogleGenerativeAI(config.gemini.apiKey);
  }

  /**
   * Generates an AI reply given the full conversation history
   * (including the new user message as the last item).
   *
   * Gemini's chat API splits the turn array in two:
   *   history  — every turn except the final user message
   *   current  — the final user message, sent via chat.sendMessage()
   *
   */
  async generateReply(messages: LLMMessage[]): Promise<string> {
    if (messages.length === 0) {
      throw createError('No messages provided.', 400);
    }

    try {
      const model = this.genai.getGenerativeModel({
        model: config.gemini.model,

        // Equivalent of Anthropic's `system` parameter
        systemInstruction: STORE_SYSTEM_PROMPT,

        generationConfig: {
          maxOutputTokens: config.gemini.maxTokens,
          temperature:     0.7,
        },

        // Mirror the Anthropic version's default safety posture
        safetySettings: [
          {
            category:  HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category:  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category:  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category:  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      // All turns except the last become the chat history
      const history: Content[] = messages.slice(0, -1).map((m) => ({
        role:  toGeminiRole(m.role),
        parts: [{ text: m.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      const chat   = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage.content);

      // .text() throws a GoogleGenerativeAIResponseError if finish reason
      // is SAFETY, RECITATION, or OTHER — caught below.
      const text = result.response.text();

      if (!text?.trim()) {
        throw createError('AI returned an empty response.', 500);
      }

      return text.trim();

    } catch (err) {

      console.log("Error in LLM", err)

      // ── Re-throw our own operational errors unchanged ──────────────────────
      if ((err as { isOperational?: boolean }).isOperational) throw err;

      // ── Safety / content-policy block ─────────────────────────────────────
      // GoogleGenerativeAIResponseError is thrown by .text() when finish
      // reason is SAFETY, RECITATION, or OTHER.
      if (err instanceof GoogleGenerativeAIResponseError) {
        throw createError(
          'I cannot respond to that request due to content policies.',
          400,
        );
      }

      // ── Timeout / abort ───────────────────────────────────────────────────
      if (err instanceof GoogleGenerativeAIAbortError) {
        throw createError('The request timed out. Please try again.', 504);
      }

      // ── HTTP-level errors from the Gemini REST endpoint ───────────────────
      if (err instanceof GoogleGenerativeAIFetchError) {
        const { status } = err;

        if (status === 401 || status === 403) {
          throw createError(
            'AI service authentication failed. Please contact support.',
            503,
          );
        }
        if (status === 429) {
          throw createError(
            'Our assistant is currently busy. Please try again in a moment.',
            503,
          );
        }
        if (status !== undefined && status >= 500) {
          throw createError(
            'The AI service is temporarily unavailable. Please try again later.',
            503,
          );
        }
        // 400 / 4xx input errors
        throw createError('Unable to process your request. Please try again.', 503);
      }

      // ── Catch-all for other GoogleGenerativeAIError subclasses ────────────
      // e.g. GoogleGenerativeAIRequestInputError (bad request body)
      if (err instanceof GoogleGenerativeAIError) {
        throw createError('Unable to process your request. Please try again.', 503);
      }

      // ── Network / DNS / TLS errors (plain Error, no status) ───────────────
      if (err instanceof Error && /network|fetch|connect|ENOTFOUND/i.test(err.message)) {
        throw createError(
          'Unable to reach the AI service. Please check connectivity.',
          503,
        );
      }

      // Unknown bug — let the global handler log the full stack
      throw err;
    }
  }
}
