import { useState } from 'react';

const STATUS_STYLES = {
  EN_COURS:       'bg-blue-50 text-blue-700',
  PAS_DE_REPONSE: 'bg-orange-50 text-orange-700',
  ENTRETIEN:      'bg-purple-50 text-purple-700',
  REFUS:          'bg-red-50 text-red-700',
  ACCEPTE:        'bg-green-50 text-green-700',
};

const STATUS_LABELS = {
  EN_COURS: 'En cours', PAS_DE_REPONSE: 'Pas de réponse',
  ENTRETIEN: 'Entretien', REFUS: 'Refus', ACCEPTE: 'Accepté',
};

function Badge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      text-xs font-700 uppercase tracking-wide ${STATUS_STYLES[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AppTable({ applications, loading, onEdit, onDelete }) {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('Tous');
  const [sort, setSort]       = useState('date-desc');

  const filtered = applications
    .filter(a => filter === 'Tous' || a.status === filter)
    .filter(a => {
      const q = search.toLowerCase();
      return [a.company, a.role, a.location, a.platform].join(' ').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.applied_date) - new Date(a.applied_date);
      if (sort === 'date-asc')  return new Date(a.applied_date) - new Date(b.applied_date);
      if (sort === 'company')   return a.company.localeCompare(b.company, 'fr');
      return 0;
    });

  const inputCls = `min-h-[40px] px-3 py-2 rounded-lg border border-stone-200
                    bg-stone-50 text-sm focus:outline-none focus:ring-2
                    focus:ring-teal-600/30 focus:border-teal-600 transition`;

  return (
    <section className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
      <h2 className="font-black text-stone-900 mb-4">Candidatures</h2>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input className={`${inputCls} flex-1 min-w-[180px]`} placeholder="Rechercher…"
               value={search} onChange={e => setSearch(e.target.value)} />
        <select className={inputCls} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="Tous">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select className={inputCls} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="date-desc">Plus récent</option>
          <option value="date-asc">Plus ancien</option>
          <option value="company">Entreprise A-Z</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-stone-400 py-8 text-center">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-stone-200 rounded-xl">
          <p className="text-stone-400 text-sm">Aucune candidature à afficher.</p>
          <p className="text-stone-300 text-xs mt-1">Ajoute une entrée ou change tes filtres.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {['Entreprise','Poste','Lieu','Plateforme','État','Date',''].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs font-700
                                         text-stone-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="py-3 px-2 font-700 text-stone-900">{app.company}</td>
                  <td className="py-3 px-2 text-stone-600">{app.role}</td>
                  <td className="py-3 px-2 text-stone-500">{app.location}</td>
                  <td className="py-3 px-2 text-stone-500">{app.platform}</td>
                  <td className="py-3 px-2"><Badge status={app.status} /></td>
                  <td className="py-3 px-2 text-stone-400 tabular-nums whitespace-nowrap">
                    {new Date(app.applied_date).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(app)}
                        className="text-xs px-3 py-1.5 rounded-full border border-stone-200
                                   hover:bg-stone-100 transition-colors font-500">
                        Modifier
                      </button>
                      <button
                        onClick={() => window.confirm(`Supprimer ${app.company} ?`) && onDelete(app.id)}
                        className="text-xs px-3 py-1.5 rounded-full border border-stone-200
                                   hover:bg-red-50 hover:text-red-600 hover:border-red-200
                                   transition-colors font-500">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}