import { pool } from '../db.js';
import { classifyEmail } from './parserService.js';

export async function processAndSaveMail(mail, userId) {
  const { emailId, subject, from, date, body } = mail;

  const { rows: existing } = await pool.query(
    'SELECT id FROM applications WHERE email_id = $1',
    [emailId]
  );
  if (existing.length > 0) return { action: 'skipped', reason: 'Mail déjà traité' };

  const classification = await classifyEmail({ subject, body, sender: from });

  if (classification.status === 'IGNORE') {
    return { action: 'skipped', reason: 'Mail non pertinent (LLM)' };
  }

  const { status, confidence, reason: classifyNote, company, role, platform } = classification;

  const domainFallback = from.split('@')[1]?.split('.')[0]?.toLowerCase() || '';
  const searchTerm     = company || domainFallback;

  let matchedApplication = null;

  if (searchTerm) {
  const { rows } = await pool.query(
    `SELECT * FROM applications
     WHERE user_id = $1
       AND LOWER(company) LIKE $2
       AND (
         role IS NULL          -- candidature sans poste → on accepte le match
         OR $3::text IS NULL   -- LLM n'a pas trouvé de poste → on accepte le match
         OR LOWER(role) LIKE $4
       )
     ORDER BY applied_date DESC
     LIMIT 1`,
    [
      userId,
      `%${searchTerm.toLowerCase()}%`,
      role,
      `%${role?.toLowerCase()}%`,
    ]
  );
  matchedApplication = rows[0] || null;
}

  if (matchedApplication) {
    const statusPriority = {
      EN_COURS: 0, PAS_DE_REPONSE: 1,
      ENTRETIEN: 2, REFUS: 3, ACCEPTE: 3,
    };

    const isUpgrade = statusPriority[status] > statusPriority[matchedApplication.status];

    if (isUpgrade) {
      await pool.query(
        `UPDATE applications
         SET status        = $1,
             email_id      = $2,
             confidence    = $3,
             classify_note = $4,
             ai_classified = TRUE,
             -- Met à jour company/role/platform si le LLM les a trouvés
             company       = COALESCE($5, company),
             role          = COALESCE($6, role),
             platform      = COALESCE($7, platform),
             updated_at    = NOW()
         WHERE id = $8`,
        [status, emailId, confidence, classifyNote,
         company, role, platform, matchedApplication.id]
      );
      return { action: 'updated', applicationId: matchedApplication.id, status };
    }

    return { action: 'skipped', reason: 'Statut déjà à jour ou supérieur' };
  }

  const { rows: newApp } = await pool.query(
    `INSERT INTO applications
       (company, role, location, platform, status, applied_date,
        email_id, source, user_id, confidence, classify_note, ai_classified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'EMAIL', $8, $9, $10, TRUE)
     RETURNING *`,
    [
      company  || 'Inconnu',
      role     || 'Non précisé',
      'Non renseigné',
      platform || 'Autre',
      status,
      date,
      emailId,
      userId,
      confidence,
      classifyNote,
    ]
  );

  return { action: 'created', applicationId: newApp[0].id, status };
}