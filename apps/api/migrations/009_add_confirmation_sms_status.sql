ALTER TABLE appointments
  ADD COLUMN confirmation_sms_status TEXT
    CHECK (confirmation_sms_status IN ('sending', 'sent', 'failed', 'disabled')),
  ADD COLUMN confirmation_sms_job_id TEXT,
  ADD COLUMN confirmation_sms_error TEXT,
  ADD COLUMN confirmation_sms_sent_at TIMESTAMPTZ;
