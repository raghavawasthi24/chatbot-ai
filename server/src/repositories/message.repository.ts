import { Pool } from 'pg';
import { Message } from '../types';

export class MessageRepository {
  constructor(private readonly pool: Pool) {}

  /** Returns messages in ascending chronological order. */
  async findByConversationId(conversationId: string, limit = 50): Promise<Message[]> {
    const { rows } = await this.pool.query<Message>(
      `SELECT id,
              conversation_id AS "conversationId",
              sender,
              text,
              created_at      AS "createdAt"
         FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        LIMIT $2`,
      [conversationId, limit],
    );
    return rows;
  }

  async create(conversationId: string, sender: 'user' | 'ai', text: string): Promise<Message> {
    const { rows } = await this.pool.query<Message>(
      `INSERT INTO messages (conversation_id, sender, text)
       VALUES ($1, $2, $3)
       RETURNING id,
                 conversation_id AS "conversationId",
                 sender,
                 text,
                 created_at      AS "createdAt"`,
      [conversationId, sender, text],
    );
    return rows[0];
  }

  /** Used to roll back an orphaned user message when the LLM call fails. */
  async deleteById(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM messages WHERE id = $1`, [id]);
  }
}
