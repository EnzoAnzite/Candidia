import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  EN_COURS:       '#006494',
  PAS_DE_REPONSE: '#da7101',
  ENTRETIEN:      '#7a39bb',
  REFUS:          '#a13544',
  ACCEPTE:        '#437a22',
};

const LABELS = {
  EN_COURS: 'En cours', PAS_DE_REPONSE: 'Pas de réponse',
  ENTRETIEN: 'Entretien', REFUS: 'Refus', ACCEPTE: 'Accepté',
};

export default function StatusChart({ applications }) {
  const data = Object.entries(LABELS)
    .map(([key, name]) => ({
      name,
      value: applications.filter(a => a.status === key).length,
    }))
    .filter(d => d.value > 0);

  if (!data.length) return (
    <section className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
      <h2 className="font-black text-stone-900 mb-4">Répartition</h2>
      <p className="text-sm text-stone-400 text-center py-12">Aucune donnée.</p>
    </section>
  );

  return (
    <section className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
      <h2 className="font-black text-stone-900 mb-4">Répartition des statuts</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={95}
               paddingAngle={3} dataKey="value">
            {data.map(entry => (
              <Cell key={entry.name}
                    fill={Object.entries(LABELS).find(([,v]) => v === entry.name)?.[0]
                          ? COLORS[Object.entries(LABELS).find(([,v]) => v === entry.name)[0]]
                          : '#ccc'} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} candidature(s)`, '']} />
          <Legend iconType="circle" iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-stone-600">{value}</span>
                  )} />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}