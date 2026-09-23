CREATE TABLE IF NOT EXISTS public.course_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_code text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  difficulty int NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  workload int NOT NULL CHECK (workload BETWEEN 1 AND 5),
  would_take_again boolean NOT NULL DEFAULT true,
  prof_name text,
  comment text CHECK (comment IS NULL OR char_length(comment) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_code)
);

CREATE INDEX IF NOT EXISTS course_ratings_code_idx
  ON public.course_ratings (course_code);

GRANT SELECT ON public.course_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_ratings TO authenticated;
GRANT ALL ON public.course_ratings TO service_role;
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'course_ratings'
      AND policyname = 'Ratings are publicly readable'
  ) THEN
    CREATE POLICY "Ratings are publicly readable"
      ON public.course_ratings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'course_ratings'
      AND policyname = 'Users insert own rating'
  ) THEN
    CREATE POLICY "Users insert own rating"
      ON public.course_ratings FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'course_ratings'
      AND policyname = 'Users update own rating'
  ) THEN
    CREATE POLICY "Users update own rating"
      ON public.course_ratings FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'course_ratings'
      AND policyname = 'Users delete own rating'
  ) THEN
    CREATE POLICY "Users delete own rating"
      ON public.course_ratings FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

CREATE OR REPLACE VIEW public.course_rating_stats
WITH (security_invoker = on) AS
SELECT
  course_code,
  count(*)::int AS rating_count,
  round(avg(rating)::numeric, 2) AS avg_rating,
  round(avg(difficulty)::numeric, 2) AS avg_difficulty,
  round(avg(workload)::numeric, 2) AS avg_workload,
  round((avg(CASE WHEN would_take_again THEN 1 ELSE 0 END) * 100)::numeric, 0)
    AS pct_would_take_again
FROM public.course_ratings
GROUP BY course_code;

GRANT SELECT ON public.course_rating_stats TO anon, authenticated, service_role;
