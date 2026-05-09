import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'test-secret'
process.env.JWT_EXPIRES_IN = '1h'

vi.mock('../src/db.js', () => ({
  pool: { query: vi.fn() },
}))

vi.mock('../src/db/queries.js', () => ({
  findOrCreateUser: vi.fn(),
  findUserById: vi.fn(),
}))

import app from '../src/index.js'
import { findUserById } from '../src/db/queries.js'

const VALID_TOKEN = jwt.sign(
  { userId: 1, email: 'test@test.com' },
  'test-secret',
  { expiresIn: '1h' }
)

describe('GET /api/health', () => {
  it('retourne status ok avec les métadonnées de l\'app', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'ok', app: 'Candidia', version: '1.0.0' })
  })
})

describe('GET /api/auth/me', () => {
  it('retourne 401 sans header Authorization', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
    expect(res.body.error).toBeTruthy()
  })

  it('retourne 401 avec un schéma autre que Bearer', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Basic dXNlcjpwYXNz')
    expect(res.status).toBe(401)
  })

  it('retourne 401 avec un token JWT invalide', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
    expect(res.status).toBe(401)
    expect(res.body.error).toBeTruthy()
  })

  it('retourne 404 si l\'utilisateur est introuvable en base', async () => {
    findUserById.mockResolvedValueOnce(null)
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
    expect(res.status).toBe(404)
  })

  it('retourne les données de l\'utilisateur connecté', async () => {
    findUserById.mockResolvedValueOnce({
      id: 1,
      email: 'test@test.com',
      token_expiry: null,
    })
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
    expect(res.status).toBe(200)
    expect(res.body.email).toBe('test@test.com')
    expect(res.body).not.toHaveProperty('access_token')
    expect(res.body).not.toHaveProperty('refresh_token')
  })
})