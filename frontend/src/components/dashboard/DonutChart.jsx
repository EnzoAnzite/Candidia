import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'motion/react'

const COLORS = {
  'En cours':       '#0D9488',
  'Entretien':      '#3B82F6',
  'Refus':          '#EF4444',
  'Accepté':        '#22C55E',
  'Pas de réponse': '#94A3B8',
}

export default function DonutChart({ data, total }) {
  // data = [{ name: 'En cours', value: 21 }, ...]

  const acceptanceRate = total > 0
    ? ((data.find(d => d.name === 'Accepté')?.value || 0) / total * 100).toFixed(1)
    : 0

  const responseRate = total > 0
    ? (((total - (data.find(d => d.name === 'Pas de réponse')?.value || 0)) / total) * 100).toFixed(1)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-3 gap-4"
    >
      {/* Donut */}
      <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex items-center gap-8">
        <div className="relative w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Total au centre */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
            <span className="text-xs text-slate-400">Total</span>
          </div>
        </div>

        {/* Légende */}
        <div className="flex flex-col gap-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[entry.name] }} />
              {entry.name} ({entry.value})
            </div>
          ))}
        </div>
      </div>

      {/* Rates */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-center gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Acceptance Rate</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{acceptanceRate}%</span>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${acceptanceRate}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Response Rate</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{responseRate}%</span>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${responseRate}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}