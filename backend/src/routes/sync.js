import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { fetchJobMails } from '../services/gmailService.js';
import { processAndSaveMail } from '../services/matcherService.js';

const router = Router();

router.use(requireAuth);

router.post('/', async (req, res) => {
  const userId = req.user.userId;

  try {
    console.log(`🔄 Sync Gmail démarrée pour ${req.user.email}`);

    // 1. Récupère les mails
    const mails = await fetchJobMails(userId);
    console.log(`📬 ${mails.length} mails récupérés`);

    // 2. Traite chaque mail
    const results = await Promise.allSettled(
      mails.map(mail => processAndSaveMail(mail, userId))
    );

    // 3. Compile les stats de la sync
    const stats = results.reduce(
      (acc, result) => {
        if (result.status === 'fulfilled') {
          acc[result.value.action] = (acc[result.value.action] || 0) + 1;
        } else {
          acc.errors = (acc.errors || 0) + 1;
          console.error('Erreur traitement mail :', result.reason);
        }
        return acc;
      },
      { created: 0, updated: 0, skipped: 0, errors: 0 }
    );

    console.log('✅ Sync terminée :', stats);
    res.json({ success: true, mailsAnalysed: mails.length, stats });

  } catch (err) {
    console.error('Erreur sync Gmail :', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;