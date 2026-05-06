import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApplications } from '../hooks/useApplications.js';
import StatsGrid from '../components/StatsGrid.jsx';
import AppTable from '../components/AppTable.jsx';
import AppForm from '../components/AppForm.jsx';
import StatusChart from '../components/StatusChart.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { applications, loading, syncing, create, update, remove, sync } = useApplications();
  const [editing, setEditing] = useState(null); // null = création, objet = modification
  const [syncStats, setSyncStats] = useState(null);

  async function handleSync() {
    const stats = await sync();
    setSyncStats(stats);
    setTimeout(() => setSyncStats(null), 5000);
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-stone-200">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="#01696f" strokeWidth="2">
                <path d="M5 7.5h14"/><path d="M5 12h10"/><path d="M5 16.5h7"/>
                <circle cx="18" cy="16.5" r="2.5" fill="#01696f" stroke="none"/>
              </svg>
            </div>
            <span className="font-black text-stone-900">Candidia</span>
          </div>

          <div className="flex items-center gap-3">
            {syncStats && (
              <span className="text-xs text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                ✓ {syncStats.created} créées · {syncStats.updated} mises à jour
              </span>
            )}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-sm font-700 px-4 py-2 rounded-full border border-stone-200
                         hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              {syncing ? 'Synchronisation…' : 'Sync Gmail'}
            </button>
            <span className="text-sm text-stone-500">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">

        {/* Stats */}
        <StatsGrid applications={applications} />

        {/* Formulaire */}
        <AppForm
          editing={editing}
          onCreate={async (data) => { await create(data); setEditing(null); }}
          onUpdate={async (id, data) => { await update(id, data); setEditing(null); }}
          onCancel={() => setEditing(null)}
        />

        {/* Tableau + Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
          <AppTable
            applications={applications}
            loading={loading}
            onEdit={setEditing}
            onDelete={remove}
          />
          <StatusChart applications={applications} />
        </div>

      </main>
    </div>
  );
}