import { motion } from 'motion/react'
import { Briefcase } from 'lucide-react'
import { Button } from '../components/ui/button'

const API_URL = import.meta.env.VITE_API_URL

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-5 w-full max-w-sm px-6"
      >
        {/* Icône */}
        <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-xl">
          <Briefcase className="text-teal-600 w-8 h-8" />
        </div>

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Candidia</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track your job applications automatically.
          </p>
        </div>

        {/* Bouton Google */}
        <a
          href={`${API_URL}/auth/google`}
          className="w-full"
        >
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-3 py-5"
          >
            {/* Logo Google SVG */}
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            <span className="text-slate-700 dark:text-slate-200 font-medium">
              Sign in with Google
            </span>
          </Button>
        </a>

        {/* Mentions */}
        <p className="text-xs text-slate-400 text-center">
          By continuing, you agree to our{' '}
          <a href="#" className="text-teal-600 hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-teal-600 hover:underline">Privacy Policy.</a>
        </p>
      </motion.div>
    </div>
  )
}