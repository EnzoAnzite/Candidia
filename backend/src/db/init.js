import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

async function init() {
  try {
    await pool.query(sql);
    console.log('Tables créées avec succès.');
  } catch (err) {
    console.error('Erreur init DB :', err.message);
  } finally {
    await pool.end();
  }
}

init();