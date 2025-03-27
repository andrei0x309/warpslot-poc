import { Database } from "bun:sqlite";

export const db: Database = new Database('src/db/db.sqlite', { create: true })

// check if table exists and create it if not
export const initDB = (): void => {
    db.run(`
        CREATE TABLE IF NOT EXISTS spins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            won_amount TEXT,
            is_win INTEGER,
            token_type TEXT,
            prize_type TEXT,
            reward_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `)
}