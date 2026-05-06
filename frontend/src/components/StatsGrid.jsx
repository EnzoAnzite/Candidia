const STATUS_AUTO_DELAY = 7; // jours

function isNoReply(app) {
  if (app.status !== 'EN_COURS') return false;
  const diff = (Date.now() - new Date(app.applied_date)) / 86400000;
  return diff >= STATUS_AUTO_DELAY;
}

export default function StatsGrid({ applications }) {
  const total    = applications.length;
  const ongoing  = applications.filter(a => a.status === 'EN_COURS' && !isNoReply(a)).length;
  const noReply  = applications.filter(a => a.status === 'PAS_DE_REPONSE' || isNoReply(a)).length;
  const accepted = applications.filter(a => a.status === 'ACCEPTE').length;
  const rate     = total ? Math.round((accepted / total) * 100) : 0;

  const cards = [
    { label: 'Total',         value: total,        sub: 'Candidatures' },
    { label: 'En cours',      value: ongoing,      sub: 'À suivre' },
    { label: 'Sans réponse',  value: noReply,       sub: 'Après 7 jours' },
    { label: 'Taux positif',  value: `${rate}%`,   sub: 'Accepté / total' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <article key={card.label}
          className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wider">{card.label}</p>
          <p className="text-3xl font-black text-stone-900 mt-2 tabular-nums">{card.value}</p>
          <p className="text-xs text-stone-400 mt-1">{card.sub}</p>
        </article>
      ))}
    </div>
  );
}