# Candidia

Suivi automatique de candidatures avec analyse des mails Gmail.

## Stack

- **Backend** : Node.js, Express, PostgreSQL, `pg`
- **Frontend** : React + Vite (à venir)
- **Auth** : OAuth2 Google / JWT (à venir)

## Lancer le projet en local

### Prérequis
- Node.js 20+
- Docker Desktop

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/EnzoAnzite/candidia.git
cd candidia

# 2. Lancer la base de données
docker compose up -d

# 3. Configurer le backend
cd backend
cp .env.example .env
# Remplis les variables dans .env

# 4. Initialiser la base
npm install
npm run db:init

# 5. Démarrer le serveur
npm run dev
```

## Variables d'environnement

Voir `backend/.env.example`.