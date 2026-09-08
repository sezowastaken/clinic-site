CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  phone TEXT NOT NULL CHECK (btrim(phone) <> ''),
  email TEXT,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX contact_messages_created_at_idx ON contact_messages(created_at);
CREATE INDEX contact_messages_is_read_idx ON contact_messages(is_read);
