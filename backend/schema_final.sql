--
-- PostgreSQL database dump
--

\restrict afZqezVbtuUlkAKt5cEWdshGhMOR0wMWC54sJJeEp61MruPZg6VZzWc0zyjd5Ti

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: source_enum; Type: TYPE; Schema: public; Owner: candidia_user
--

CREATE TYPE public.source_enum AS ENUM (
    'MANUAL',
    'EMAIL'
);


ALTER TYPE public.source_enum OWNER TO candidia_user;

--
-- Name: status_enum; Type: TYPE; Schema: public; Owner: candidia_user
--

CREATE TYPE public.status_enum AS ENUM (
    'EN_COURS',
    'PAS_DE_REPONSE',
    'ENTRETIEN',
    'REFUS',
    'ACCEPTE'
);


ALTER TYPE public.status_enum OWNER TO candidia_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: candidia_user
--

CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company text NOT NULL,
    role text,
    location text NOT NULL,
    platform text DEFAULT 'Autre'::text NOT NULL,
    status public.status_enum DEFAULT 'EN_COURS'::public.status_enum NOT NULL,
    applied_date date NOT NULL,
    link text,
    notes text,
    email_id text,
    source public.source_enum DEFAULT 'MANUAL'::public.source_enum NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    confidence double precision,
    classify_note text,
    ai_classified boolean DEFAULT false
);


ALTER TABLE public.applications OWNER TO candidia_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: candidia_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    access_token text,
    refresh_token text,
    token_expiry timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_sync_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO candidia_user;

--
-- Name: applications applications_email_id_key; Type: CONSTRAINT; Schema: public; Owner: candidia_user
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_email_id_key UNIQUE (email_id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: candidia_user
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: candidia_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: candidia_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: candidia_user
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict afZqezVbtuUlkAKt5cEWdshGhMOR0wMWC54sJJeEp61MruPZg6VZzWc0zyjd5Ti

