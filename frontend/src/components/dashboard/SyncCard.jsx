import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function SyncCard({ status, logs, stats, onClose }) {
  // status: 'syncing' | 'success' | 'error'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 right-6 z-50 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          {status === 'syncing' && (
            <RefreshCw className="w-4 h-4 text-teal-500 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-semibold text-slate-800 dark:text-white">
            {status === 'syncing' && 'Synchronisation Gmail en cours…'}
            {status === 'success' && 'Synchronisation terminée'}
            {status === 'error' && 'Erreur de synchronisation'}
          </span>
          {status !== 'syncing' && (
            <button
              onClick={onClose}
              className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Logs */}
        <div className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 max-h-48 overflow-y-auto flex flex-col gap-1">
          {logs.length === 0 && (
            <span className="text-slate-400">Analyse des 100 derniers emails…</span>
          )}
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="leading-relaxed"
            >
              {log}
            </motion.div>
          ))}
        </div>

        {/* Stats finales */}
        {status === 'success' && stats && (
          <div className="px-4 py-3 flex items-center gap-4 text-sm border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Emails analysés :</span>
            <span className="font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-slate-500">Candidatures :</span>
            <span className="font-bold text-teal-600">{stats.inserted ?? 0}</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}