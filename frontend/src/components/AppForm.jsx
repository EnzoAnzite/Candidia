import { useState, useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: 'EN_COURS',        label: 'En cours' },
  { value: 'PAS_DE_REPONSE',  label: 'Pas de réponse' },
  { value: 'ENTRETIEN',       label: 'Entretien' },
  { value: 'REFUS',           label: 'Refus' },
  { value: 'ACCEPTE',         label: 'Accepté' },
];

const EMPTY = {
  company: '', role: '', location: '', platform: '',
  status: 'EN_COURS', applied_date: new Date().toISOString().split('T')[0],
  link: '', notes: '',
};

export default function AppForm({ editing, onCreate, onUpdate, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const isEditing = !!editing;

  useEffect(() => {
    if (editing) {
      setForm({
        ...editing,
        applied_date: editing.applied_date?.split('T')[0] || EMPTY.applied_date,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (isEditing) await onUpdate(editing.id, form);
    else await onCreate(form);
    setForm(EMPTY);
  }

  const inputCls = `w-full min-h-[44px] px-3 py-2 rounded-lg border border-stone-200
                    bg-stone-50 text-sm focus:outline-none focus:ring-2
                    focus:ring-teal-600/30 focus:border-teal-600 transition`;

  return (
    <section className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-black text-stone-900">
          {isEditing ? 'Modifier la candidature' : 'Nouvelle candidature'}
        </h2>
        {isEditing && (
          <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-700">
            Modification
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {[
          { label: 'Entreprise',  field: 'company',  placeholder: 'OVHcloud', required: true },
          { label: 'Poste',       field: 'role',     placeholder: 'Dev Fullstack DevOps', required: true },
          { label: 'Lieu',        field: 'location', placeholder: 'Lyon / Remote', required: true },
          { label: 'Plateforme',  field: 'platform', placeholder: 'LinkedIn', required: true },
        ].map(({ label, field, placeholder, required }) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-xs font-700 text-stone-600 uppercase tracking-wider">
              {label}
            </label>
            <input className={inputCls} value={form[field]} onChange={set(field)}
                   placeholder={placeholder} required={required} />
          </div>
        ))}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-700 text-stone-600 uppercase tracking-wider">État</label>
          <select className={inputCls} value={form.status} onChange={set('status')}>
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-700 text-stone-600 uppercase tracking-wider">
            Date de candidature
          </label>
          <input type="date" className={inputCls}
                 value={form.applied_date} onChange={set('applied_date')} required />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs font-700 text-stone-600 uppercase tracking-wider">
            Lien de l'offre
          </label>
          <input type="url" className={inputCls} value={form.link}
                 onChange={set('link')} placeholder="https://..." />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-4">
          <label className="text-xs font-700 text-stone-600 uppercase tracking-wider">Notes</label>
          <textarea className={`${inputCls} min-h-[80px] resize-y`}
                    value={form.notes} onChange={set('notes')}
                    placeholder="Stack, contact RH, date de relance..." />
        </div>

        <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
          <button type="submit"
            className="px-5 py-2 rounded-full bg-[#01696f] text-white text-sm
                       font-700 hover:bg-[#0c4e54] transition-colors">
            {isEditing ? 'Mettre à jour' : 'Enregistrer'}
          </button>
          <button type="button" onClick={() => { setForm(EMPTY); onCancel(); }}
            className="px-5 py-2 rounded-full border border-stone-200 text-sm
                       font-700 hover:bg-stone-50 transition-colors">
            Réinitialiser
          </button>
        </div>
      </form>
    </section>
  );
}