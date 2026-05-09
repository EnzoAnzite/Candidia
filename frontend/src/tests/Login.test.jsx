import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: () => ({ children = null }) => children }),
  AnimatePresence: ({ children = null }) => children,
}))

describe('Login page', () => {
  it('affiche le titre Candidia', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Candidia' })).toBeInTheDocument()
  })

  it('affiche la description de l\'app', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    expect(screen.getByText(/track your job applications automatically/i)).toBeInTheDocument()
  })

  it('affiche le bouton Sign in with Google', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument()
  })

  it('le lien Google pointe vers /auth/google', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    const links = screen.getAllByRole('link')
    const googleLink = links.find(l => l.getAttribute('href')?.includes('/auth/google'))
    expect(googleLink).toBeDefined()
  })

  it('affiche les liens Terms of Service et Privacy Policy', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument()
  })
})