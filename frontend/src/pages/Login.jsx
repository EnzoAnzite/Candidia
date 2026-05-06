export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-10 w-full max-w-sm text-center">

        {/* Logo SVG */}
        <div className="mx-auto mb-6 w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="#01696f" strokeWidth="2" aria-label="Logo Candidia">
            <path d="M5 7.5h14"/><path d="M5 12h10"/><path d="M5 16.5h7"/>
            <circle cx="18" cy="16.5" r="2.5" fill="#01696f" stroke="none"/>
          </svg>
        </div>

        <h1 className="text-xl font-black text-stone-900 mb-1">Candidia</h1>
        <p className="text-sm text-stone-500 mb-8">
          Connecte ta boîte Gmail pour suivre<br />tes candidatures automatiquement.
        </p>

        <a
          href="http://localhost:3001/api/auth/google"
          className="flex items-center justify-center gap-3 w-full py-3 px-4
                     border border-stone-200 rounded-full text-sm font-700
                     hover:bg-stone-50 transition-colors"
        >
          <img
            src="https://cdn.simpleicons.org/google/4285F4"
            alt="Google" width="18" height="18"
          />
          Se connecter avec Google
        </a>
      </div>
    </div>
  );
}