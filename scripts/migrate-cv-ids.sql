-- IDEMPOTENT: Safe to run multiple times. Only adds 'id' if missing.

-- 1. Object arrays: experience, education, projects
-- (customFields already has label+value, just add id)
DO $$
DECLARE arr_field TEXT;
BEGIN
  FOREACH arr_field IN ARRAY ARRAY['experience','education','projects'] LOOP
    EXECUTE format($q$
      UPDATE cvs SET data = jsonb_set(data, '{%1$s}',
        COALESCE((
          SELECT jsonb_agg(
            CASE WHEN item ? 'id' THEN item
                 ELSE item || jsonb_build_object('id', gen_random_uuid()::text)
            END
          ) FROM jsonb_array_elements(data->%1$L) item
        ), data->%1$L)
      )
      WHERE data ? %1$L AND jsonb_array_length(data->%1$L) > 0
    $q$, arr_field);
  END LOOP;
END $$;

-- 2. customFields: same pattern (object, add id)
UPDATE cvs SET data = jsonb_set(data, '{personal,customFields}',
  COALESCE((
    SELECT jsonb_agg(
      CASE WHEN item ? 'id' THEN item
           ELSE item || jsonb_build_object('id', gen_random_uuid()::text)
      END
    ) FROM jsonb_array_elements(data->'personal'->'customFields') item
  ), data->'personal'->'customFields')
)
WHERE data->'personal' ? 'customFields'
  AND jsonb_array_length(data->'personal'->'customFields') > 0;

-- 3. String arrays: skills, certification, language
-- Convert "React" -> {"id": "uuid", "value": "React"} (idempotent: skips if already object)
DO $$
DECLARE arr_field TEXT;
BEGIN
  FOREACH arr_field IN ARRAY ARRAY['skills','certification','language'] LOOP
    EXECUTE format($q$
      UPDATE cvs SET data = jsonb_set(data, '{%1$s}',
        COALESCE((
          SELECT jsonb_agg(
            CASE WHEN jsonb_typeof(elem) = 'object' AND elem ? 'id' THEN elem
                 WHEN jsonb_typeof(elem) = 'string'
                  THEN jsonb_build_object('id', gen_random_uuid()::text, 'value', elem#>>'{}')
                 ELSE elem
            END
          ) FROM jsonb_array_elements(data->%1$L) elem
        ), data->%1$L)
      )
      WHERE data ? %1$L AND jsonb_array_length(data->%1$L) > 0
    $q$, arr_field);
  END LOOP;
END $$;
