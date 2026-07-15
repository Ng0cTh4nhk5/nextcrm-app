-- =============================================================================
-- Migration: Fix function search_path + move vector extension
-- Date: 2026-07-15
--
-- Fixes three Supabase security lints:
--   WARN 0011  function_search_path_mutable  (2 functions)
--   WARN 0014  extension_in_public           (pgvector)
--
-- Why search_path matters:
--   A mutable search_path allows an attacker with CREATE privilege in any
--   schema to shadow objects (e.g., operators, types) that the function
--   depends on, potentially hijacking its execution.
--   Pinning search_path = public eliminates that attack surface.
-- =============================================================================

-- ── 1. Pin search_path on trigger functions ───────────────────────────────────
--
-- These are trigger functions (no arguments, return trigger).
-- ALTER FUNCTION is safe here — it does NOT change the function body,
-- only adds/updates the SET search_path configuration parameter.

ALTER FUNCTION public.invoices_search_vector_update()
  SET search_path = public;

ALTER FUNCTION public.invoices_search_vector_from_line_item()
  SET search_path = public;

-- ── 2. Move pgvector extension out of public schema ───────────────────────────
--
-- Supabase recommends keeping extensions in a dedicated schema so they
-- don't pollute the public namespace exposed via PostgREST.
--
-- Steps:
--   a) Create the target schema (idempotent).
--   b) Move the extension — this re-installs all vector objects under the
--      new schema; existing table columns of type vector are unaffected
--      because Postgres tracks the type by OID, not by schema path.
--   c) Grant USAGE so the service_role (Prisma) can still resolve types.
--
-- NOTE: If your Supabase project already installed 'vector' in the
--       'extensions' schema (some hosted projects do), this block will
--       error with "extension already exists in schema extensions".
--       In that case, simply comment out the ALTER EXTENSION line below.

CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage so Prisma / service_role can still resolve pgvector types
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;

-- Move the extension (safe for existing vector columns)
ALTER EXTENSION vector SET SCHEMA extensions;

-- =============================================================================
-- Verification queries (run manually after applying):
--
-- Check functions have fixed search_path:
--   SELECT proname, proconfig
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'public'
--     AND proname IN ('invoices_search_vector_update',
--                     'invoices_search_vector_from_line_item');
--   Expected: proconfig contains 'search_path=public'
--
-- Check vector extension schema:
--   SELECT extname, extnamespace::regnamespace FROM pg_extension WHERE extname = 'vector';
--   Expected: extensions
-- =============================================================================
