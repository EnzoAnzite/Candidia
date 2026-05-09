import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsCards from '../components/dashboard/StatsCards'

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: () => ({ children = null }) => children }),
  AnimatePresence: ({ children = null }) => children,
}))

describe('StatsCards', () => {
  const stats = { total: 12, interviews: 3, rejections: 4, pending: 5 }

  it('affiche les 4 labels de cartes', () => {
    render(<StatsCards stats={stats} />)
    expect(screen.getByText(/total applications/i)).toBeInTheDocument()
    expect(screen.getByText(/interviews/i)).toBeInTheDocument()
    expect(screen.getByText(/rejections/i)).toBeInTheDocument()
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
  })

  it('affiche les valeurs numériques correctes', () => {
    render(<StatsCards stats={stats} />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('affiche "—" pour chaque carte quand stats est null', () => {
    render(<StatsCards stats={null} />)
    const dashes = screen.getAllByText('—')
    expect(dashes).toHaveLength(4)
  })

  it('affiche "—" pour chaque carte quand stats est undefined', () => {
    render(<StatsCards />)
    const dashes = screen.getAllByText('—')
    expect(dashes).toHaveLength(4)
  })
})
