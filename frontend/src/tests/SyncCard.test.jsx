import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SyncCard from '../components/dashboard/SyncCard'

vi.mock('motion/react', async () => {
  const React = await vi.importActual('react')
  return {
    motion: new Proxy({}, {
      get(_, tag) {
        return function MockMotion({ children = null, initial: _i, animate: _a, exit: _e, transition: _t, whileHover: _wh, whileTap: _wt, layout: _l, ...props }) {
          return React.createElement(tag, props, children)
        }
      },
    }),
    AnimatePresence: ({ children = null }) => children,
  }
})

describe('SyncCard', () => {
  it('affiche "Synchronisation Gmail en cours…" pendant le chargement', () => {
    render(<SyncCard status="syncing" logs={[]} stats={null} onClose={vi.fn()} />)
    expect(screen.getByText(/synchronisation gmail en cours/i)).toBeInTheDocument()
  })

  it('affiche "Synchronisation terminée" en cas de succès', () => {
    render(<SyncCard status="success" logs={[]} stats={null} onClose={vi.fn()} />)
    expect(screen.getByText(/synchronisation terminée/i)).toBeInTheDocument()
  })

  it('affiche "Erreur de synchronisation" en cas d\'erreur', () => {
    render(<SyncCard status="error" logs={[]} stats={null} onClose={vi.fn()} />)
    expect(screen.getByText(/erreur de synchronisation/i)).toBeInTheDocument()
  })

  it('rend les entrées de log dans l\'ordre', () => {
    const logs = ['📬 Récupération des emails…', '✅ 5 emails analysés']
    render(<SyncCard status="success" logs={logs} stats={null} onClose={vi.fn()} />)
    expect(screen.getByText('📬 Récupération des emails…')).toBeInTheDocument()
    expect(screen.getByText('✅ 5 emails analysés')).toBeInTheDocument()
  })

  it('masque le bouton ✕ pendant la synchronisation', () => {
    render(<SyncCard status="syncing" logs={[]} stats={null} onClose={vi.fn()} />)
    expect(screen.queryByText('✕')).not.toBeInTheDocument()
  })

  it('affiche le bouton ✕ en cas de succès', () => {
    render(<SyncCard status="success" logs={[]} stats={null} onClose={vi.fn()} />)
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('appelle onClose quand ✕ est cliqué', () => {
    const onClose = vi.fn()
    render(<SyncCard status="success" logs={[]} stats={null} onClose={onClose} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('affiche les stats finales quand status=success et stats fourni', () => {
    const stats = { total: 20, inserted: 3 }
    render(<SyncCard status="success" logs={[]} stats={stats} onClose={vi.fn()} />)
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
