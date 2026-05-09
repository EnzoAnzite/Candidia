import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ThemeProvider } from '../context/ThemeContext'

function renderNavbar({ onRefresh = vi.fn(), onLogout = vi.fn() } = {}) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Navbar onRefresh={onRefresh} onLogout={onLogout} />
      </ThemeProvider>
    </MemoryRouter>
  )
}

afterEach(() => {
  document.documentElement.classList.remove('dark')
})

describe('Navbar', () => {
  it('affiche le logo Candidia', () => {
    renderNavbar()
    expect(screen.getByText('Candidia')).toBeInTheDocument()
  })

  it('le logo est un lien vers /dashboard', () => {
    renderNavbar()
    const link = screen.getByRole('link', { name: 'Candidia' })
    expect(link.getAttribute('href')).toBe('/dashboard')
  })

  it('appelle onRefresh quand le bouton sync est cliqué', () => {
    const onRefresh = vi.fn()
    renderNavbar({ onRefresh })
    // Boutons : [theme-toggle, refresh, logout]
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1])
    expect(onRefresh).toHaveBeenCalledOnce()
  })

  it('appelle onLogout quand le bouton logout est cliqué', () => {
    const onLogout = vi.fn()
    renderNavbar({ onLogout })
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[2])
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('bascule la classe "dark" sur <html> au clic du bouton thème', () => {
    renderNavbar()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('repasse en mode clair au second clic sur le bouton thème', () => {
    renderNavbar()
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    fireEvent.click(buttons[0])
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
