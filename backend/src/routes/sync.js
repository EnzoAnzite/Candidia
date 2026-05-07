import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { syncUserMails } from '../services/syncService.js';

const router = Router();

router.use(requireAuth);

router.post('/', async (req, res) => {
  const userId = req.user.userId;

  try {
    console.log(`🔄 Sync Gmail démarrée pour ${req.user.email}`);

    const stats = await syncUserMails(userId, 'manual');

    console.log('✅ Sync terminée :', stats);
    res.json({ success: true, mailsAnalysed: stats.total, stats });

  } catch (err) {
    console.error('Erreur sync Gmail :', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;