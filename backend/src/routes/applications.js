import { Router } from 'express';
import { pool } from '../db.js';
import { z } from 'zod';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

const applicationSchema = z.object({
  company:      z.string().min(1, 'Champ obligatoire'),
  role:         z.string().min(1, 'Champ obligatoire'),
  location:     z.string().min(1, 'Champ obligatoire'),
  platform:     z.string().min(1, 'Champ obligatoire'),
  status:       z.enum(['EN_COURS','PAS_DE_REPONSE','ENTRETIEN','REFUS','ACCEPTE']).optional(),
  applied_date: z.string(),
  link:         z.string().url().optional().or(z.literal('')),
  notes:        z.string().optional(),
});

// GET — toutes les candidatures
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM applications ORDER BY applied_date DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — une seule candidature
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM applications WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Candidature introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — créer
router.post('/', async (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { company, role, location, platform, status, applied_date, link, notes } = parsed.data;

  try {
    const { rows } = await pool.query(
      `INSERT INTO applications (company, role, location, platform, status, applied_date, link, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        company,
        role,
        location,
        platform,
        status ?? 'EN_COURS',
        applied_date,
        link || null,
        notes || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — modifier
router.put('/:id', async (req, res) => {
  const parsed = applicationSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const data = parsed.data;
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }

  if (!fields.length) return res.status(400).json({ error: 'Aucun champ à mettre à jour.' });

  fields.push(`updated_at = NOW()`);
  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE applications SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Candidature introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — supprimer
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM applications WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;