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

vi.mock('../src/services/syncService.js', () => ({
  syncUserMails: vi.fn(),
}))

import app from '../src/index.js'
import { syncUserMails } from '../src/services/syncService.js'

const AUTH_HEADER = `Bearer ${jwt.sign(
  { userId: 1, email: 'test@test.com' },
  'test-secret',
  { expiresIn: '1h' }
)}`

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/sync', () => {
  it('retourne 401 sans authentification', async () => {
    const res = await request(app).post('/api/sync')
    expect(res.status).toBe(401)
  })

  it('lance la synchronisation et retourne les statistiques', async () => {
    syncUserMails.mockResolvedValueOnce({
      total: 5,
      created: 3,
      updated: 1,
      skipped: 1,
      errors: 0,
      mode: 'manual',
    })

    const res = await request(app)
      .post('/api/sync')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.mailsAnalysed).toBe(5)
    expect(res.body.stats).toMatchObject({
      created: 3,
      updated: 1,
      skipped: 1,
      errors: 0,
      mode: 'manual',
    })
  })

  it('appelle syncUserMails avec le bon userId', async () => {
    syncUserMails.mockResolvedValueOnce({ total: 0, created: 0, updated: 0, skipped: 0, errors: 0, mode: 'manual' })

    await request(app)
      .post('/api/sync')
      .set('Authorization', AUTH_HEADER)

    expect(syncUserMails).toHaveBeenCalledWith(1, 'manual')
  })

  it('retourne 500 si la synchronisation échoue', async () => {
    syncUserMails.mockRejectedValueOnce(new Error('Gmail API indisponible'))

    const res = await request(app)
      .post('/api/sync')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Gmail API indisponible')
  })
})
