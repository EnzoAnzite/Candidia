import { pool } from '../db.js';

export async function findOrCreateUser(email, accessToken, refreshToken, tokenExpiry) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, access_token, refresh_token, token_expiry)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
       SET access_token  = EXCLUDED.access_token,
           refresh_token = COALESCE(EXCLUDED.refresh_token, users.refresh_token),
           token_expiry  = EXCLUDED.token_expiry,
           updated_at    = NOW()
     RETURNING *`,
    [email, accessToken, refreshToken, tokenExpiry]
  );
  return rows[0];
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, token_expiry FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function getUserTokens(id) {
  const { rows } = await pool.query(
    'SELECT access_token, refresh_token, token_expiry FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}