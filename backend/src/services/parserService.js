import OpenAI from 'openai';

const mistral = new OpenAI({
  apiKey:  process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1',
});

const SYSTEM_PROMPT = `Tu es un assistant expert en analyse d'emails de recrutement, en français et en anglais.

Ta mission est d'analyser l'email fourni et de retourner un objet JSON avec les informations suivantes.

### STATUT — choisis UNE seule valeur :
- "EN_COURS" : accusé de réception d'une candidature, confirmation d'envoi de CV, mail RH générique disant qu'ils étudient le dossier
- "ENTRETIEN" : invitation explicite à un entretien (téléphonique, visio, présentiel), proposition de créneaux, demande de disponibilités pour un échange
- "REFUS" : rejet explicite ("nous ne donnons pas suite", "votre profil ne correspond pas", "nous avons retenu d'autres candidatures", "poste pourvu")
- "ACCEPTE" : offre d'emploi formelle, proposition de contrat, validation finale après processus
- "IGNORE" : newsletter, email promotionnel d'un magasin ou service, offre d'emploi non sollicitée (job alert), email sans rapport avec une candidature que TU as envoyée, publicité, confirmation d'achat, facture

### RÈGLES IMPORTANTES :
- Un email promotionnel d'un magasin (Lidl, Amazon, Fnac, etc.) est TOUJOURS "IGNORE"
- Un "job alert" ou liste d'offres d'emploi envoyée automatiquement est TOUJOURS "IGNORE"
- Seuls les emails en réponse directe à UNE candidature spécifique que tu as envoyée sont pertinents
- Si tu n'es pas sûr que c'est en lien avec une candidature active, mets "IGNORE"

### ENTREPRISE :
- Cherche le NOM COMPLET de l'entreprise qui recrute dans le corps du mail, la signature, ou l'en-tête
- Ce n'est PAS forcément le domaine de l'expéditeur (ex: mail envoyé depuis "noreply@greenhouse.io" mais l'entreprise est "Datadog")
- Cherche des indices : "L'équipe [Entreprise]", "Bonjour, je suis [prénom] de [Entreprise]", signature, logo mentionné
- Si tu trouves le nom : retourne-le tel quel (ex: "OVHcloud", "Société Générale", "Alan")
- Si tu ne trouves vraiment pas : retourne null

### POSTE :
- Cherche l'intitulé exact du poste dans le corps du mail ("votre candidature au poste de [X]", "pour le rôle de [X]")
- NE PAS utiliser l'objet du mail brut comme intitulé
- Si tu trouves : retourne l'intitulé propre (ex: "Développeur Fullstack DevOps", "Software Engineer Backend")
- Si tu ne trouves pas : retourne null

### PLATEFORME :
- Cherche d'où vient la candidature dans le corps du mail
- Plateformes possibles : "LinkedIn", "Indeed", "HelloWork", "Welcome to the Jungle", "Glassdoor", "Monster", "Apec", "Pole Emploi", "Talent.io", "Huntr", "site carrières"
- Si le mail mentionne explicitement la plateforme : retourne-la
- Si tu ne sais pas : retourne null

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{
  "status": "EN_COURS" | "ENTRETIEN" | "REFUS" | "ACCEPTE" | "IGNORE",
  "confidence": number entre 0.0 et 1.0,
  "reason": "explication courte en français, max 15 mots",
  "company": "Nom de l'entreprise" | null,
  "role": "Intitulé du poste" | null,
  "platform": "Nom de la plateforme" | null
}`;

const VALID_STATUSES = ['EN_COURS', 'ENTRETIEN', 'REFUS', 'ACCEPTE', 'IGNORE'];

export async function classifyEmail({ subject, body, sender }) {
  const userMessage = `
Expéditeur : ${sender}
Objet : ${subject}
Corps du mail :
${body?.slice(0, 4000) || ''}
  `.trim();

  try {
    const response = await mistral.chat.completions.create({
      model:           'mistral-small-latest',
      temperature:     0,
      max_tokens:      300,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userMessage },
      ],
    });

    const result = JSON.parse(response.choices[0].message.content);

    if (!VALID_STATUSES.includes(result.status)) {
      return { status: 'EN_COURS', confidence: 0, reason: 'Statut invalide', company: null, role: null, platform: null };
    }

    return {
      status:     result.status,
      confidence: result.confidence ?? 0.5,
      reason:     result.reason     ?? '',
      company:    result.company    ?? null,
      role:       result.role       ?? null,
      platform:   result.platform   ?? null,
    };

  } catch (err) {
    console.error('[parserService] Erreur Mistral :', err.message);
    return { status: 'EN_COURS', confidence: 0, reason: 'Erreur API', company: null, role: null, platform: null };
  }
}

// Ces fonctions ne sont plus utilisées pour l'extraction principale
// mais gardées si tu en as besoin ailleurs
export function extractCompanyFromSender(from) {
  const domain = from.split('@')[1]?.split('.')[0]?.toLowerCase() || '';
  return domain || null;
}

export function extractRoleFromSubject(subject) {
  return subject?.slice(0, 100) || null;
}