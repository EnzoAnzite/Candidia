import { Moon, Sun, RefreshCw, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Button } from './ui/button'

export default function Navbar({ onRefresh, onLogout }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 flex items-center justify-between">

      {/* Logo */}
      <Link to="/dashboard" className="text-lg font-bold text-slate-900 dark:text-white">
        Candidia
      </Link>

      {/* Actions droite */}
      <div className="flex items-center gap-2">

        {/* Toggle dark/light */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </Button>

        {/* Refresh */}
        <Button variant="ghost" size="icon" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* Logout */}
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-red-500 hover:text-red-600">
          <LogOut className="w-4 h-4" />
        </Button>

      </div>
    </nav>
  )
}