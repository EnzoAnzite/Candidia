import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'

const STATUS_MAP = {
  'EN_COURS':        'En cours',
  'ENTRETIEN':       'Entretien',
  'REFUS':           'Refus',
  'ACCEPTE':         'Accepté',
  'PAS_DE_REPONSE':  'Pas de réponse',
}

export function useApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/applications')
      const mapped = data.map(app => ({
        ...app,
        status: STATUS_MAP[app.status] ?? app.status,
        applied_date: new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        updated_at: new Date(app.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }))
      setApplications(mapped)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  // Stats
  const stats = {
    total:      applications.length,
    interviews: applications.filter(a => a.status === 'Entretien').length,
    rejections: applications.filter(a => a.status === 'Refus').length,
    pending:    applications.filter(a => a.status === 'Pas de réponse').length,
  }

  // Chart data
  const chartData = Object.entries(
    applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  return { applications, stats, chartData, loading, refetch: fetchApplications }
}