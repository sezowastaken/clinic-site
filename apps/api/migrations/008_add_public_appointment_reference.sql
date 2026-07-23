ALTER TABLE appointments ADD COLUMN public_reference TEXT;

-- Backfill existing rows with a random 16-character uppercase hex reference (per-row, since gen_random_uuid() is volatile).
UPDATE appointments
SET public_reference = substr(upper(replace(gen_random_uuid()::text, '-', '')), 1, 16)
WHERE public_reference IS NULL;

ALTER TABLE appointments
  ALTER COLUMN public_reference SET NOT NULL,
  ALTER COLUMN public_reference SET DEFAULT substr(upper(replace(gen_random_uuid()::text, '-', '')), 1, 16);

ALTER TABLE appointments
  ADD CONSTRAINT appointments_public_reference_key UNIQUE (public_reference);

-- Single source of truth for phone matching: derived from `phone`, so it can never drift or be bypassed by app code.
ALTER TABLE appointments
  ADD COLUMN phone_normalized TEXT GENERATED ALWAYS AS (
    CASE
      WHEN regexp_replace(phone, '[^0-9]', '', 'g') ~ '^90[0-9]{10}$'
        THEN regexp_replace(phone, '[^0-9]', '', 'g')
      WHEN regexp_replace(phone, '[^0-9]', '', 'g') ~ '^0[0-9]{10}$'
        THEN '90' || substr(regexp_replace(phone, '[^0-9]', '', 'g'), 2)
      WHEN regexp_replace(phone, '[^0-9]', '', 'g') ~ '^5[0-9]{9}$'
        THEN '90' || regexp_replace(phone, '[^0-9]', '', 'g')
      ELSE regexp_replace(phone, '[^0-9]', '', 'g')
    END
  ) STORED;

CREATE INDEX appointments_phone_normalized_idx ON appointments (phone_normalized);
