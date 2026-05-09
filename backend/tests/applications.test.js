import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'test-secret'

vi.mock('../src/db.js', () => ({
  pool: { query: vi.fn() },
}))

vi.mock('../src/db/queries.js', () => ({
  findOrCreateUser: vi.fn(),
  findUserById: vi.fn(),
}))

import app from '../src/index.js'
import { pool } from '../src/db.js'

const AUTH_HEADER = `Bearer ${jwt.sign(
  { userId: 1, email: 'test@test.com' },
  'test-secret',
  { expiresIn: '1h' }
)}`

const MOCK_APP = {
  id: 1,
  company: 'Google',
  role: 'Software Engineer',
  location: 'Paris',
  platform: 'LinkedIn',
  status: 'EN_COURS',
  applied_date: '2024-01-15',
  link: null,
  notes: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── GET /api/applications ────────────────────────────────────────────────────

describe('GET /api/applications', () => {
  it('retourne 401 sans authentification', async () => {
    const res = await request(app).get('/api/applications')
    expect(res.status).toBe(401)
  })

  it('retourne la liste de toutes les candidatures', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_APP] })
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', AUTH_HEADER)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].company).toBe('Google')
  })

  it('retourne un tableau vide si aucune candidature', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', AUTH_HEADER)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })
})

// ─── GET /api/applications/:id ────────────────────────────────────────────────

describe('GET /api/applications/:id', () => {
  it('retourne la candidature correspondante', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_APP] })
    const res = await request(app)
      .get('/api/applications/1')
      .set('Authorization', AUTH_HEADER)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(1)
    expect(res.body.company).toBe('Google')
  })

  it('retourne 404 si la candidature est introuvable', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })
    const res = await request(app)
      .get('/api/applications/999')
      .set('Authorization', AUTH_HEADER)
    expect(res.status).toBe(404)
    expect(res.body.error).toBeTruthy()
  })

  it('retourne 401 sans authentification', async () => {
    const res = await request(app).get('/api/applications/1')
    expect(res.status).toBe(401)
  })
})

// ─── POST /api/applications ───────────────────────────────────────────────────

describe('POST /api/applications', () => {
  it('crée une candidature avec un corps valide', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_APP] })
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', AUTH_HEADER)
      .send({
        company: 'Google',
        role: 'Software Engineer',
        location: 'Paris',
        platform: 'LinkedIn',
        applied_date: '2024-01-15',
      })
    expect(res.status).toBe(201)
    expect(res.body.company).toBe('Google')
    expect(res.body.status).toBe('EN_COURS')
  })

  it('retourne 400 si des champs obligatoires sont manquants', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', AUTH_HEADER)
      .send({ company: 'Google' }) // role, location, platform, applied_date manquants
    expect(res.status).toBe(400)
  })

  it('retourne 400 si le champ company est vide', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', AUTH_HEADER)
      .send({
        company: '',
        role: 'Engineer',
        location: 'Paris',
        platform: 'LinkedIn',
        applied_date: '2024-01-15',
      })
    expect(res.status).toBe(400)
  })

  it('retourne 400 avec un statut invalide', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', AUTH_HEADER)
      .send({
        company: 'Google',
        role: 'Engineer',
        location: 'Paris',
        platform: 'LinkedIn',
        applied_date: '2024-01-15',
        status: 'INVALIDE',
      })
    expect(res.status).toBe(400)
  })

  it('retourne 400 avec un lien URL malformé', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', AUTH_HEADER)
      .send({
        company: 'Google',
        role: 'Engineer',
        location: 'Paris',
        platform: 'LinkedIn',
        applied_date: '2024-01-15',
        link: 'pas-une-url',
      })
    expect(res.status).toBe(400)
  })

  it('accepte tous les statuts valides', async () => {
    const statuses = ['EN_COURS', 'PAS_DE_REPONSE', 'ENTRETIEN', 'REFUS', 'ACCEPTE']
    for (const status of statuses) {
      pool.query.mockResolvedValueOnce({ rows: [{ ...MOCK_APP, status }] })
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', AUTH_HEADER)
        .send({
          company: 'Google',
          role: 'Engineer',
          location: 'Paris',
          platform: 'LinkedIn',
          applied_date: '2024-01-15',
          status,
        })
      expect(res.status).toBe(201)
      expect(res.body.status).toBe(status)
    }
  })

  it('retourne 401 sans authentification', async () => {
    const res = await request(app).post('/api/applications').send({})
    expect(res.status).toBe(401)
  })
})

// ─── PUT /api/applications/:id ────────────────────────────────────────────────

describe('PUT /api/applications/:id', () => {
  it('met à jour le statut d\'une candidature', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ ...MOCK_APP, status: 'ENTRETIEN' }] })
    const res = await request(app)
      .put('/api/applications/1')
      .set('Authorization', AUTH_HEADER)
      .send({ status: 'ENTRETIEN' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ENTRETIEN')
  })

  it('met à jour plusieurs champs simultanément', async () => {
    const updated = { ...MOCK_APP, notes: 'Bon entretien', status: 'ENTRETIEN' }
    pool.query.mockResolvedValueOnce({ rows: [updated] })
    const res = await request(app)
      .put('/api/applications/1')
      .set('Authorization', AUTH_HEADER)
      .send({ notes: 'Bon entretien', status: 'ENTRETIEN' })
    expect(res.status).toBe(200)
    expect(res.body.notes).toBe('Bon entretien')
  })

  it('retourne 404 si la candidature est introuvable', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })
    const res = await request(app)
      .put('/api/applications/999')
      .set('Authorization', AUTH_HEADER)
      .send({ status: 'ENTRETIEN' })
    expect(res.status).toBe(404)
  })

  it('retourne 400 si aucun champ n\'est fourni', async () => {
    const res = await request(app)
      .put('/api/applications/1')
      .set('Authorization', AUTH_HEADER)
      .send({})
    expect(res.status).toBe(400)
  })

  it('retourne 401 sans authentification', async () => {
    const res = await request(app).put('/api/applications/1').send({ status: 'REFUS' })
    expect(res.status).toBe(401)
  })
})

// ─── DELETE /api/applications/:id ────────────────────────────────────────────

describe('DELETE /api/applications/:id', () => {
  it('supprime une candidature et retourne 204', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })
    const res = await request(app)
      .delete('/api/applications/1')
      .set('Authorization', AUTH_HEADER)
    expect(res.status).toBe(204)
    expect(res.body).toEqual({})
  })

  it('retourne 401 sans authentification', async () => {
    const res = await request(app).delete('/api/applications/1')
    expect(res.status).toBe(401)
  })
})
