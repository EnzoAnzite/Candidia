import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import AuthCallback from '../pages/AuthCallback'

function renderAuthCallback() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthCallback />
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  window.__candidia_token = null
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AuthCallback page', () => {
  it('redirige vers / si aucun token dans l\'URL', () => {
    vi.stubGlobal('location', { search: '' })
    renderAuthCallback()
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('appelle /auth/me avec le token et redirige vers /dashboard en cas de succès', async () => {
    vi.stubGlobal('location', { search: '?token=valid-jwt' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({ id: 1, email: 'user@test.com' }),
    })

    renderAuthCallback()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({ headers: { Authorization: 'Bearer valid-jwt' } })
      )
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })
  })

  it('redirige vers / si l\'appel API échoue', async () => {
    vi.stubGlobal('location', { search: '?token=bad-token' })
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    renderAuthCallback()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })
})
