import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Erreur connexion PostgreSQL :', err.message);
  } else {
    console.log('✅ Connecté à PostgreSQL — Candidia DB');
    release();
  }
});