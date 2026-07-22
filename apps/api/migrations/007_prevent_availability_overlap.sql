ALTER TABLE availability_windows
  ADD CONSTRAINT availability_windows_no_overlap
  EXCLUDE USING gist (
    tstzrange(starts_at, ends_at, '[)') WITH &&
  );
