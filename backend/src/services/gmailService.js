import { google }       from 'googleapis';
import { simpleParser } from 'mailparser';
import { getUserTokens } from '../db/queries.js';

async function getAuthenticatedClient(userId) {
  const tokens = await getUserTokens(userId);
  if (!tokens) throw new Error('Tokens Gmail introuvables pour cet utilisateur.');

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date:   tokens.token_expiry ? new Date(tokens.token_expiry).getTime() : null,
  });

  return client;
}

export async function fetchJobMails(userId, gmailQuery = '') {
  const client = await getAuthenticatedClient(userId);
  const gmail  = google.gmail({ version: 'v1', auth: client });

  // Construit la requête finale
  const baseKeywords = 'subject:(candidature OR entretien OR offre OR recrutement OR poste OR application)';
  const fullQuery    = gmailQuery ? `${baseKeywords} ${gmailQuery}` : baseKeywords;
  const maxResults   = gmailQuery === 'newer_than:30d' ? 500 : 100;

  const listResponse = await gmail.users.messages.list({
    userId: 'me',
    q:      fullQuery,
    maxResults,
  });

  const messages = listResponse.data.messages;
  if (!messages || messages.length === 0) return [];

  // Récupère le contenu complet de chaque mail
  const rawMails = await Promise.all(
    messages.map(m =>
      gmail.users.messages.get({
        userId: 'me',
        id:     m.id,
        format: 'raw',
      })
    )
  );

  // Parse chaque mail avec mailparser
  const parsed = await Promise.all(
    rawMails.map(async (m) => {
      const raw  = Buffer.from(m.data.raw, 'base64');
      const mail = await simpleParser(raw);
      return {
        emailId: m.data.id,
        subject: mail.subject || '',
        from:    mail.from?.text || '',
        date:    mail.date || new Date(),
        body:    mail.text || mail.html || '',
      };
    })
  );

  return parsed;
}