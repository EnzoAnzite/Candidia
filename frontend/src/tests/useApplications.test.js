import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

vi.mock('../api/client', () => ({
  default: { get: vi.fn() },
}))

import { useApplications } from '../hooks/useApplications'
import api from '../api/client'

const RAW_APPLICATIONS = [
  {
    id: 1, company: 'Google', role: 'Engineer', platform: 'LinkedIn',
    status: 'EN_COURS', applied_date: '2024-01-15T00:00:00Z', updated_at: '2024-01-16T00:00:00Z',
  },
  {
    id: 2, company: 'Meta', role: 'Designer', platform: 'Welcome to the Jungle',
    status: 'ENTRETIEN', applied_date: '2024-01-10T00:00:00Z', updated_at: '2024-01-12T00:00:00Z',
  },
  {
    id: 3, company: 'Amazon', role: 'PM', platform: 'Indeed',
    status: 'REFUS', applied_date: '2024-01-05T00:00:00Z', updated_at: '2024-01-06T00:00:00Z',
  },
  {
    id: 4, company: 'Apple', role: 'QA', platform: 'LinkedIn',
    status: 'PAS_DE_REPONSE', applied_date: '2024-01-01T00:00:00Z', updated_at: '2024-01-02T00:00:00Z',
  },
]

beforeEach(() => {
  api.get.mockResolvedValue({ data: RAW_APPLICATIONS })
})

describe('useApplications hook', () => {
  it('démarre en état loading', () => {
    const { result } = renderHook(() => useApplications())
    expect(result.current.loading).toBe(true)
  })

  it('charge et expose les candidatures', async () => {
    const { result } = renderHook(() => useApplications())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.applications).toHaveLength(4)
    expect(api.get).toHaveBeenCalledWith('/applications')
  })

  it('traduit tous les statuts en libellés lisibles', async () => {
    const { result } = renderHook(() => useApplications())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const statuses = result.current.applications.map(a => a.status)
    expect(statuses).toContain('En cours')
    expect(statuses).toContain('Entretien')
    expect(statuses).toContain('Refus')
    expect(statuses).toContain('Pas de réponse')
  })

  it('calcule les stats correctement', async () => {
    const { result } = renderHook(() => useApplications())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.stats).toEqual({
      total: 4,
      interviews: 1,
      rejections: 1,
      pending: 1,
    })
  })

  it('construit chartData avec la bonne forme { name, value }', async () => {
    const { result } = renderHook(() => useApplications())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const { chartData } = result.current
    expect(chartData).toBeInstanceOf(Array)
    expect(chartData[0]).toHaveProperty('name')
    expect(chartData[0]).toHaveProperty('value')
    expect(chartData.reduce((sum, d) => sum + d.value, 0)).toBe(4)
  })

  it('refetch recharge les données depuis l\'API', async () => {
    const { result } = renderHook(() => useApplications())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.get.mockResolvedValueOnce({ data: [] })
    await act(() => result.current.refetch())
    await waitFor(() => expect(result.current.applications).toHaveLength(0))
  })
})
