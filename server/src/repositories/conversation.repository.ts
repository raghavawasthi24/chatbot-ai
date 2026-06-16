import { Pool } from 'pg';
import { Conversation } from '../types';

export class ConversationRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Conversation | null> {
    const { rows } = await this.pool.query<Conversation>(
      `SELECT id,
              created_at AS "createdAt",
              updated_at AS "updatedAt",
              metadata
         FROM conversations
        WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(metadata: Record<string, unknown> = {}): Promise<Conversation> {
    const { rows } = await this.pool.query<Conversation>(
      `INSERT INTO conversations (metadata)
       VALUES ($1)
       RETURNING id,
                 created_at AS "createdAt",
                 updated_at AS "updatedAt",
                 metadata`,
      [metadata],
    );
    return rows[0];
  }

  /** Bumps updated_at so recently-active sessions sort to the top. */
  async touch(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [id],
    );
  }
}
