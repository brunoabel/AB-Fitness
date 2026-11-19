-- Migration: 20261133_trainer_b2b2c_trial_and_biometrics.sql
-- 1. Ativa Trial PRO de 14 dias no aluno ao resgatar código de convite de Personal Trainer
-- 2. Cria RPC get_athlete_recovery_for_trainer para o treinador monitorizar fadiga e wearables do atleta

CREATE OR REPLACE FUNCTION public.redeem_trainer_invite_code(p_code TEXT)
RETURNS TABLE (trainer_id UUID, trainer_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_uid UUID := (SELECT auth.uid());
    v_trainer_id UUID;
    v_trainer_name TEXT;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Autenticação necessária.' USING ERRCODE = '28000';
    END IF;

    SELECT id, full_name INTO v_trainer_id, v_trainer_name
    FROM public.profiles
    WHERE trainer_invite_code = upper(trim(p_code)) AND role IN ('coach', 'admin', 'ceo');

    IF v_trainer_id IS NULL THEN
        RAISE EXCEPTION 'Código de convite inválido.' USING ERRCODE = '22023';
    END IF;

    IF v_trainer_id = v_uid THEN
        RAISE EXCEPTION 'Não podes vincular-te a ti próprio.' USING ERRCODE = '22023';
    END IF;

    UPDATE public.trainer_rosters
    SET status = 'archived', updated_at = timezone('utc'::text, now())
    WHERE athlete_id = v_uid AND trainer_id <> v_trainer_id AND status = 'active';

    INSERT INTO public.trainer_rosters (trainer_id, athlete_id, status)
    VALUES (v_trainer_id, v_uid, 'active')
    ON CONFLICT (trainer_id, athlete_id) DO UPDATE
        SET status = 'active', updated_at = timezone('utc'::text, now())
        WHERE public.trainer_rosters.status <> 'active';

    -- Ativa Trial PRO B2B2C de 14 dias para o aluno vinculado
    UPDATE public.profiles
    SET trial_ends_at = GREATEST(coalesce(trial_ends_at, now()), now() + interval '14 days'),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_uid;

    RETURN QUERY SELECT v_trainer_id, v_trainer_name;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_trainer_invite_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_trainer_invite_code(TEXT) TO authenticated;

-- RPC para o treinador visualizar prontidão de wearables e fadiga muscular do aluno
CREATE OR REPLACE FUNCTION public.get_athlete_recovery_for_trainer(p_athlete_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_bio JSONB;
    v_fatigue JSONB;
BEGIN
    IF NOT public.is_active_trainer_of(p_athlete_id) THEN
        RAISE EXCEPTION 'Acesso negado: atleta não vinculado.' USING ERRCODE = '42501';
    END IF;

    SELECT to_jsonb(b) INTO v_bio
    FROM (
        SELECT provider, date, recovery_score, hrv_ms, resting_hr_bpm, sleep_score, day_strain, last_Point.updated_at
        FROM public.athlete_biometrics AS last_Point
        WHERE user_id = p_athlete_id
        ORDER BY date DESC, updated_at DESC
        LIMIT 1
    ) b;

    WITH window_limit AS (
      SELECT make_interval(hours => 72) AS w
    ),
    hard_sets AS (
      SELECT s.id AS session_id, s.completed_at, l.exercise_code, count(*)::numeric AS n
      FROM public.workout_sessions s
      JOIN public.exercise_logs l ON l.session_id = s.id
      CROSS JOIN window_limit wl
      WHERE s.user_id = p_athlete_id
        AND s.completed_at >= now() - wl.w
        AND s.completed_at <= now()
        AND l.completed
        AND l.reps_completed > 0
      GROUP BY 1, 2, 3
    ),
    workout_stimulus AS (
      SELECT h.session_id::text AS event_id, h.completed_at, t.muscle_id, sum(h.n * t.weight) AS s
      FROM hard_sets h
      JOIN public.exercise_muscle_targets t ON t.exercise_code = h.exercise_code
      GROUP BY 1, 2, 3
    ),
    runs_data AS (
      SELECT r.id AS event_id,
             r.created_at AS completed_at,
             (r.distance_km / 2.5) * (1 + coalesce(r.elevation_gain_m, 0)::numeric / 300.0) AS s_base
      FROM public.runs r
      CROSS JOIN window_limit wl
      WHERE r.user_id = p_athlete_id
        AND r.created_at >= now() - wl.w
        AND r.created_at <= now()
        AND r.distance_km > 0
    ),
    runs_stimulus AS (
      SELECT rd.event_id, rd.completed_at, m.muscle_id, (rd.s_base * m.weight) AS s
      FROM runs_data rd
      CROSS JOIN (
        VALUES 
          ('quadriceps', 0.7::numeric),
          ('posteriores', 0.6::numeric),
          ('gemeos', 0.9::numeric)
      ) AS m(muscle_id, weight)
    ),
    all_stimulus AS (
      SELECT event_id, completed_at, muscle_id, s FROM workout_stimulus
      UNION ALL
      SELECT event_id, completed_at, muscle_id, s FROM runs_stimulus
    ),
    per_session AS (
      SELECT x.muscle_id, x.completed_at,
             100 * (1 - exp(-x.s / 6.0))
                 * power(0.5, extract(epoch FROM now() - x.completed_at) / 3600.0 / r.half_life_h) AS f
      FROM all_stimulus x
      JOIN public.muscle_regions r ON r.muscle_id = x.muscle_id
    ),
    combined AS (
      SELECT p.muscle_id,
             100 * (1 - exp(sum(ln(greatest(1 - p.f / 100, 1e-6))))) AS f
      FROM per_session p
      GROUP BY 1
    )
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'muscle_id', r.muscle_id,
      'fatigue', round(coalesce(c.f, 0), 1),
      'recovery', round(100 - coalesce(c.f, 0), 1)
    ) ORDER BY r.sort_order), '[]'::jsonb)
    INTO v_fatigue
    FROM public.muscle_regions r
    LEFT JOIN combined c ON c.muscle_id = r.muscle_id;

    RETURN jsonb_build_object(
      'biometrics', v_bio,
      'fatigue', v_fatigue
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_athlete_recovery_for_trainer(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_athlete_recovery_for_trainer(UUID) TO authenticated;
