-- Migration: 20261132_wearables_strava_garmin.sql
-- Alarga suporte de fornecedores de wearables para Strava e Garmin Connect

ALTER TABLE public.wearable_connections
  DROP CONSTRAINT IF EXISTS wearable_connections_provider_check;

ALTER TABLE public.wearable_connections
  ADD CONSTRAINT wearable_connections_provider_check
  CHECK (provider IN ('whoop', 'fitbit', 'strava', 'garmin'));

ALTER TABLE public.athlete_biometrics
  DROP CONSTRAINT IF EXISTS athlete_biometrics_provider_check;

ALTER TABLE public.athlete_biometrics
  ADD CONSTRAINT athlete_biometrics_provider_check
  CHECK (provider IN ('whoop', 'fitbit', 'strava', 'garmin', 'composite'));
