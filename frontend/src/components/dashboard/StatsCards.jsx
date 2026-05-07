import { Briefcase, CalendarCheck, XCircle, Clock } from 'lucide-react'
import { motion } from 'motion/react'

const cards = [
  { label: 'Total Applications', key: 'total',      icon: Briefcase,     color: 'text-teal-600' },
  { label: 'Interviews',         key: 'interviews',  icon: CalendarCheck, color: 'text-blue-500' },
  { label: 'Rejections',         key: 'rejections',  icon: XCircle,       color: 'text-red-500'  },
  { label: 'Pending / No Response', key: 'pending',  icon: Clock,         color: 'text-slate-400'},
]

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {card.label}
            </span>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.[card.key] ?? '—'}
          </span>
        </motion.div>
      ))}
    </div>
  )
}