CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL CHECK (btrim(patient_name) <> ''),
  phone TEXT NOT NULL CHECK (btrim(phone) <> ''),
  email TEXT,
  service_id UUID NOT NULL REFERENCES services(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show')),
  source TEXT NOT NULL DEFAULT 'website'
    CHECK (source IN ('website', 'phone', 'whatsapp', 'email', 'instagram', 'referral', 'other')),
  patient_note TEXT,
  internal_note TEXT,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  CHECK (ends_at > starts_at)
);

CREATE INDEX appointments_starts_at_idx ON appointments(starts_at);
CREATE INDEX appointments_status_idx ON appointments(status);

-- Only pending/confirmed appointments occupy time; cancelled/rejected/completed/no_show do not block scheduling.
ALTER TABLE appointments
  ADD CONSTRAINT appointments_no_overlap
  EXCLUDE USING gist (
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'confirmed'));
