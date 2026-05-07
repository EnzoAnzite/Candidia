import { fetchJobMails }      from './gmailService.js';
import { processAndSaveMail } from './matcherService.js';
import { pool }               from '../db.js';

export async function syncUserMails(userId, mode = 'manual') {
  const { rows } = await pool.query(
    'SELECT COUNT(*) FROM applications WHERE user_id = $1',
    [userId]
  );
  const hasApplications = parseInt(rows[0].count) > 0;

  let gmailQuery;
  if (!hasApplications) {
    gmailQuery = 'newer_than:30d';
  } else if (mode === 'weekly') {
    gmailQuery = 'newer_than:7d';
  } else {
    gmailQuery = '';
  }

  const mails = await fetchJobMails(userId, gmailQuery);

  const stats = { created: 0, updated: 0, skipped: 0, errors: 0, total: mails.length, mode };

  for (const mail of mails) {
    try {
      const result = await processAndSaveMail(mail, userId);
      if (result.action === 'created')      stats.created++;
      else if (result.action === 'updated') stats.updated++;
      else                                  stats.skipped++;
    } catch (err) {
      console.error('[syncService] Erreur mail :', err.message);
      stats.errors++;
    }
  }

  await pool.query(
    'UPDATE users SET last_sync_at = NOW() WHERE id = $1',
    [userId]
  );

  return stats;
}