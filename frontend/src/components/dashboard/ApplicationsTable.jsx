import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Pencil, Plus, X, Check } from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../ui/select'
import api from '../../api/client'

const STATUS_STYLES = {
  'En cours':        'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  'Entretien':       'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'Refus':           'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'Accepté':         'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'Pas de réponse':  'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

const STATUSES = Object.keys(STATUS_STYLES)
const PAGE_SIZE = 20

const EMPTY_FORM = { company: '', role: '', platform: '', status: 'En cours', applied_date: '' }

export default function ApplicationsTable({ applications = [], onRefresh }) {
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatus]     = useState('all')
  const [platformFilter, setPlatform] = useState('all')
  const [page, setPage]               = useState(1)
  const [editingId, setEditingId]     = useState(null)
  const [editData, setEditData]       = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newApp, setNewApp]           = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)

  // Filtres
  const filtered = applications.filter(app => {
    const matchSearch   = app.company.toLowerCase().includes(search.toLowerCase())
    const matchStatus   = statusFilter === 'all'   || app.status === statusFilter
    const matchPlatform = platformFilter === 'all' || app.platform === platformFilter
    return matchSearch && matchStatus && matchPlatform
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const platforms  = [...new Set(applications.map(a => a.platform).filter(Boolean))]

  // Modifier
  const startEdit = (app) => {
    setEditingId(app.id)
    setEditData({ company: app.company, role: app.role, platform: app.platform, status: app.status, applied_date: app.applied_date })
  }

  const saveEdit = async (id) => {
    setSaving(true)
    try {
      await api.put(`/applications/${id}`, editData)
      onRefresh?.()
      setEditingId(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Ajouter
  const saveNew = async () => {
    if (!newApp.company || !newApp.role) return
    setSaving(true)
    try {
      await api.post('/applications', newApp)
      onRefresh?.()
      setShowAddForm(false)
      setNewApp(EMPTY_FORM)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col gap-4">

      {/* Filtres + bouton ajout */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Search applications..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-64"
          />

          <Select value={statusFilter} onValueChange={v => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={platformFilter} onValueChange={v => { setPlatform(v); setPage(1) }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Platform: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Platform: All</SelectItem>
              {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setShowAddForm(v => !v)}
          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      {/* Formulaire d'ajout */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-teal-200 dark:border-teal-800 rounded-lg p-4 bg-teal-50 dark:bg-teal-900/20 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Entreprise *</label>
                <Input
                  placeholder="Google"
                  value={newApp.company}
                  onChange={e => setNewApp(p => ({ ...p, company: e.target.value }))}
                  className="w-40"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Poste *</label>
                <Input
                  placeholder="Dev Frontend"
                  value={newApp.role}
                  onChange={e => setNewApp(p => ({ ...p, role: e.target.value }))}
                  className="w-44"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Plateforme</label>
                <Input
                  placeholder="LinkedIn"
                  value={newApp.platform}
                  onChange={e => setNewApp(p => ({ ...p, platform: e.target.value }))}
                  className="w-36"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Statut</label>
                <Select value={newApp.status} onValueChange={v => setNewApp(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Date</label>
                <Input
                  type="date"
                  value={newApp.applied_date}
                  onChange={e => setNewApp(p => ({ ...p, applied_date: e.target.value }))}
                  className="w-36"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveNew} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => { setShowAddForm(false); setNewApp(EMPTY_FORM) }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wide">
              <th className="text-left py-3 pr-4">Company</th>
              <th className="text-left py-3 pr-4">Role</th>
              <th className="text-left py-3 pr-4">Platform</th>
              <th className="text-left py-3 pr-4">Status</th>
              <th className="text-left py-3 pr-4">Applied Date</th>
              <th className="text-left py-3 pr-4">Last Update</th>
              <th className="text-left py-3">Actions</th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            <motion.tbody
              key={page + statusFilter + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {paginated.map((app) => (
                <tr key={app.id}
                  className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">

                  {editingId === app.id ? (
                    <>
                      <td className="py-2 pr-2"><Input value={editData.company} onChange={e => setEditData(p => ({ ...p, company: e.target.value }))} className="h-8 w-32" /></td>
                      <td className="py-2 pr-2"><Input value={editData.role} onChange={e => setEditData(p => ({ ...p, role: e.target.value }))} className="h-8 w-36" /></td>
                      <td className="py-2 pr-2"><Input value={editData.platform} onChange={e => setEditData(p => ({ ...p, platform: e.target.value }))} className="h-8 w-28" /></td>
                      <td className="py-2 pr-2">
                        <Select value={editData.status} onValueChange={v => setEditData(p => ({ ...p, status: v }))}>
                          <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 pr-2"><Input type="date" value={editData.applied_date} onChange={e => setEditData(p => ({ ...p, applied_date: e.target.value }))} className="h-8 w-36" /></td>
                      <td className="py-2 pr-2 text-slate-500">{app.updated_at}</td>
                      <td className="py-2 flex gap-1">
                        <Button size="icon" className="h-8 w-8 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => saveEdit(app.id)} disabled={saving}>
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditingId(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">{app.company}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{app.role}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{app.platform}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[app.status]}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-500">{app.applied_date}</td>
                      <td className="py-3 pr-4 text-slate-500">{app.updated_at}</td>
                      <td className="py-3">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(app)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}
              className={p === page ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}>
              {p}
            </Button>
          ))}
          {totalPages > 5 && <span className="px-2">...</span>}
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
        </div>
      </div>
    </div>
  )
}