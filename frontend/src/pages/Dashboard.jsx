import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApplications } from '../hooks/useApplications'
import Navbar from '../components/Navbar'
import StatsCards from '../components/dashboard/StatsCards'
import DonutChart from '../components/dashboard/DonutChart'
import ApplicationsTable from '../components/dashboard/ApplicationsTable'
import SyncCard from '../components/dashboard/SyncCard'
import api from '../api/client'

export default function Dashboard() {
  const { applications, stats, chartData, loading, refetch } = useApplications()
  const navigate = useNavigate()
  const [syncStatus, setSyncStatus] = useState(null) // null | 'syncing' | 'success' | 'error'
  const [syncLogs, setSyncLogs] = useState([])
  const [syncStats, setSyncStats] = useState(null)

  const handleSync = async () => {
    setSyncStatus('syncing')
    setSyncLogs([])
    setSyncStats(null)

    setSyncLogs(l => [...l, '🔄 Connexion à Gmail…'])

    try {
      setSyncLogs(l => [...l, '📬 Récupération des 100 derniers emails…'])
      const res = await api.post('/sync')
      const data = res.data

      setSyncLogs(l => [
        ...l,
        `✅ ${data.mailsAnalysed} emails analysés`,
        `📋 ${data.stats?.inserted ?? 0} nouvelles candidatures détectées`,
        `🔁 ${data.stats?.updated ?? 0} candidatures mises à jour`,
      ])
      setSyncStats(data.stats)
      setSyncStatus('success')
      refetch()
    } catch (err) {
      setSyncLogs(l => [...l, `❌ Erreur : ${err.message}`])
      setSyncStatus('error')
    }
  }

  const handleLogout = async () => {
    await api.post('/auth/logout')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar onRefresh={handleSync} onLogout={handleLogout} />

      {syncStatus && (
        <SyncCard
          status={syncStatus}
          logs={syncLogs}
          stats={syncStats}
          onClose={() => setSyncStatus(null)}
        />
      )}

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
        <StatsCards stats={stats} />
        <DonutChart data={chartData} total={stats?.total ?? 0} />
        <ApplicationsTable applications={applications} />
      </main>
    </div>
  )
}