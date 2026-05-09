import { describe, it, expect, vi } from 'vitest'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'test-secret'

import { requireAuth } from '../src/middleware/authMiddleware.js'

function mockReq(authorizationHeader) {
  return { headers: { authorization: authorizationHeader } }
}

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('requireAuth middleware', () => {
  it('retourne 401 si le header Authorization est absent', () => {
    const req = mockReq(undefined)
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }))
    expect(next).not.toHaveBeenCalled()
  })

  it('retourne 401 si le schéma n\'est pas Bearer', () => {
    const req = mockReq('Basic dXNlcjpwYXNz')
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('retourne 401 avec un token JWT invalide', () => {
    const req = mockReq('Bearer token.completement.invalide')
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('retourne 401 avec un token signé avec le mauvais secret', () => {
    const token = jwt.sign({ userId: 1, email: 'test@test.com' }, 'mauvais-secret')
    const req = mockReq(`Bearer ${token}`)
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('retourne 401 avec un token expiré', () => {
    const token = jwt.sign({ userId: 1, email: 'test@test.com' }, 'test-secret', {
      expiresIn: -1, // expiré immédiatement
    })
    const req = mockReq(`Bearer ${token}`)
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('appelle next() et attache req.user avec un token valide', () => {
    const token = jwt.sign({ userId: 42, email: 'user@test.com' }, 'test-secret', {
      expiresIn: '1h',
    })
    const req = mockReq(`Bearer ${token}`)
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.user).toMatchObject({ userId: 42, email: 'user@test.com' })
    expect(res.status).not.toHaveBeenCalled()
  })
})
