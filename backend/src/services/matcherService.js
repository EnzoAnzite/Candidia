import { pool } from '../db.js';
import { detectStatus, extractCompanyFromSender, extractRoleFromSubject } from './parserService.js';

export async function processAndSaveMail(mail, userId) {
  const { emailId, subject, from, date, body } = mail;

  // 1. Vérifie si ce mail a déjà été traité
  const { rows: existing } = await pool.query(
    'SELECT id FROM applications WHERE email_id = $1',
    [emailId]
  );
  if (existing.length > 0) return { action: 'skipped', reason: 'Mail déjà traité' };

  // 2. Détecte le statut
  const status = detectStatus(subject, body);

  // 3. Extrait les infos du mail
  const companyFromMail = extractCompanyFromSender(from);
  const roleFromMail    = extractRoleFromSubject(subject);

  // 4. Cherche une candidature existante qui correspond
  //    Stratégie : cherche une candidature EN_COURS dont l'entreprise
  //    ressemble au domaine de l'expéditeur
  let matchedApplication = null;

  if (companyFromMail) {
    const { rows } = await pool.query(
      `SELECT * FROM applications
       WHERE user_id = $1
         AND LOWER(company) LIKE $2
       ORDER BY applied_date DESC
       LIMIT 1`,
      [userId, `%${companyFromMail.toLowerCase()}%`]
    );
    matchedApplication = rows[0] || null;
  }

  if (matchedApplication) {
    // 5a. Match trouvé → met à jour le statut si c'est une évolution
    const statusPriority = {
      EN_COURS: 0,
      PAS_DE_REPONSE: 1,
      ENTRETIEN: 2,
      REFUS: 3,
      ACCEPTE: 3,
    };

    const isUpgrade = statusPriority[status] > statusPriority[matchedApplication.status];

    if (isUpgrade) {
      await pool.query(
        `UPDATE applications
         SET status     = $1,
             email_id   = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [status, emailId, matchedApplication.id]
      );
      return { action: 'updated', applicationId: matchedApplication.id, status };
    }

    return { action: 'skipped', reason: 'Statut déjà à jour ou supérieur' };
  }

  // 5b. Pas de match → crée une nouvelle candidature
  const { rows: newApp } = await pool.query(
    `INSERT INTO applications
       (company, role, location, platform, status, applied_date, email_id, source, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'EMAIL', $8)
     RETURNING *`,
    [
      companyFromMail || 'Inconnu',
      roleFromMail    || subject,
      'Non renseigné',
      'Email',
      status,
      date,
      emailId,
      userId,
    ]
  );

  return { action: 'created', applicationId: newApp[0].id, status };
}