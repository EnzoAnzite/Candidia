CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE status_enum AS ENUM (
    'EN_COURS',
    'PAS_DE_REPONSE',
    'ENTRETIEN',
    'REFUS',
    'ACCEPTE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE source_enum AS ENUM (
    'MANUAL',
    'EMAIL'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  access_token  TEXT,
  refresh_token TEXT,
  token_expiry  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Table applications
CREATE TABLE IF NOT EXISTS applications (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company      TEXT        NOT NULL,
  role         TEXT        NOT NULL,
  location     TEXT        NOT NULL,
  platform     TEXT        NOT NULL,
  status       status_enum NOT NULL DEFAULT 'EN_COURS',
  applied_date DATE        NOT NULL,
  link         TEXT,
  notes        TEXT,
  email_id     TEXT        UNIQUE,
  source       source_enum NOT NULL DEFAULT 'MANUAL',
  user_id      UUID        REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);