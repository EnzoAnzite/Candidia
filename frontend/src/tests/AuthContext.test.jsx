import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

afterEach(() => {
  window.__candidia_token = null
})

describe('AuthContext', () => {
  it('user est null par défaut', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
  })

  it('login() stocke le token dans window.__candidia_token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login('my-jwt', { id: 1, email: 'user@test.com' }))
    expect(window.__candidia_token).toBe('my-jwt')
  })

  it('login() met à jour l\'utilisateur', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login('my-jwt', { id: 1, email: 'user@test.com' }))
    expect(result.current.user).toEqual({ id: 1, email: 'user@test.com' })
  })

  it('logout() efface le token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login('my-jwt', { id: 1, email: 'user@test.com' }))
    act(() => result.current.logout())
    expect(window.__candidia_token).toBeNull()
  })

  it('logout() remet user à null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login('my-jwt', { id: 1, email: 'user@test.com' }))
    act(() => result.current.logout())
    expect(result.current.user).toBeNull()
  })
})
