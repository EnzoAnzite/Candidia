// Patterns de détection par statut
// Ordre important : du plus spécifique au plus général
const STATUS_PATTERNS = {
  ACCEPTE: [
    /nous sommes heureux de vous proposer/i,
    /nous avons le plaisir de vous offrir/i,
    /offre d.emploi.*vous est proposée/i,
    /pleased to offer you/i,
    /welcome to the team/i,
    /you.ve been selected/i,
  ],
  REFUS: [
    /nous avons retenu d.autres candidats/i,
    /votre candidature n.a pas été retenue/i,
    /nous ne donnons pas suite/i,
    /après examen.*ne pouvons pas/i,
    /nous avons décidé de ne pas/i,
    /unfortunately.*not moving forward/i,
    /we regret to inform/i,
    /not been successful/i,
    /n.avons pas retenu/i,
    /sans suite/i,
  ],
  ENTRETIEN: [
    /vous convier à un entretien/i,
    /souhaiterions vous rencontrer/i,
    /rendez-vous.*entretien/i,
    /entretien.*téléphonique/i,
    /entretien.*visio/i,
    /interview.*schedule/i,
    /disponibilités.*entretien/i,
    /nous souhaitons échanger avec vous/i,
  ],
  EN_COURS: [
    /bien reçu votre candidature/i,
    /candidature.*bien été enregistrée/i,
    /merci pour votre candidature/i,
    /nous avons bien reçu/i,
    /application received/i,
    /thank you for applying/i,
    /votre dossier.*en cours d.examen/i,
  ],
};

export function detectStatus(subject, body) {
  const text = `${subject} ${body}`;

  for (const [status, patterns] of Object.entries(STATUS_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(text))) {
      return status;
    }
  }

  // Aucun pattern trouvé → on laisse EN_COURS par défaut
  return 'EN_COURS';
}

export function extractCompanyFromSender(from) {
  // "Recruteur chez OVHcloud <recruteur@ovhcloud.com>"
  // → on extrait le domaine : ovhcloud

  const emailMatch = from.match(/<(.+)>/);
  const email = emailMatch ? emailMatch[1] : from;
  const domain = email.split('@')[1] || '';

  // Retire les extensions et sous-domaines courants
  const company = domain
    .replace(/\.(com|fr|io|net|org|eu|co\.uk)$/i, '')
    .replace(/^(mail|noreply|no-reply|careers|recrutement|rh|jobs)\./i, '')
    .split('.')[0]; // prend juste la première partie

  return company || null;
}

export function extractRoleFromSubject(subject) {
  // Retire les préfixes courants pour garder l'intitulé du poste
  return subject
    .replace(/^(re:|fwd?:|candidature|offre d.emploi|objet)\s*/i, '')
    .replace(/\s*[-–|]\s*.+$/, '') // retire ce qui suit un tiret
    .trim();
}