import { google } from 'googleapis';
import { simpleParser } from 'mailparser';
import { getUserTokens } from '../db/queries.js';
import { oauth2Client } from '../routes/auth.js';

async function getAuthenticatedClient(userId) {
  const tokens = await getUserTokens(userId);
  if (!tokens) throw new Error('Tokens Gmail introuvables pour cet utilisateur.');

  // Recrée un client OAuth2 avec les tokens de l'utilisateur
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

  // Si le token est expiré, googleapis le rafraîchit automatiquement
  // grâce au refresh_token
  return client;
}

export async function fetchJobMails(userId) {
  const client = await getAuthenticatedClient(userId);
  const gmail = google.gmail({ version: 'v1', auth: client });

  // Requête Gmail — filtre les mails liés aux candidatures
  const query = [
    'subject:(candidature OR entretien OR offre OR recrutement OR poste OR application)',
    'newer_than:90d',
  ].join(' ');

  const listResponse = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 100,
  });

  const messages = listResponse.data.messages;
  if (!messages || messages.length === 0) return [];

  // Récupère le contenu complet de chaque mail
  const rawMails = await Promise.all(
    messages.map(m =>
      gmail.users.messages.get({
        userId: 'me',
        id: m.id,
        format: 'raw', // format brut pour mailparser
      })
    )
  );

  // Parse chaque mail avec mailparser
  const parsed = await Promise.all(
    rawMails.map(async (m) => {
      const raw = Buffer.from(m.data.raw, 'base64');
      const mail = await simpleParser(raw);
      return {
        emailId:  m.data.id,
        subject:  mail.subject || '',
        from:     mail.from?.text || '',
        date:     mail.date || new Date(),
        body:     mail.text || mail.html || '',
      };
    })
  );

  return parsed;
}