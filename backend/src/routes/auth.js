import { Router } from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findOrCreateUser, findUserById } from '../db/queries.js';

dotenv.config();

const router = Router();

// Client OAuth2 partagé — réutilisé dans gmailService plus tard
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// ÉTAPE 1 du flux OAuth2 — redirige vers Google
router.get('/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',  // indispensable pour obtenir un refresh_token
    prompt: 'consent',       // force Google à renvoyer le refresh_token à chaque fois
    scope: SCOPES,
  });
  res.redirect(url);
});

// ÉTAPE 2 du flux OAuth2 — Google rappelle ici avec un `code`
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=access_denied`);
  }

  try {
    // Échange le code contre des tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Récupère les infos de l'utilisateur Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    // Sauvegarde ou met à jour l'utilisateur en base
    const user = await findOrCreateUser(
      googleUser.email,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date ? new Date(tokens.expiry_date) : null
    );

    // Génère un JWT pour le frontend
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Redirige vers le frontend avec le token dans l'URL
    // Le frontend le récupère et le stocke en mémoire
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`);

  } catch (err) {
    console.error('Erreur OAuth2 callback :', err.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
});

// GET /api/auth/me — retourne l'utilisateur connecté (route protégée)
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
});

export default router;