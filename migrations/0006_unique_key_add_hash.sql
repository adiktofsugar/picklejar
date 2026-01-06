-- Migration number: 0006 	 2026-01-05
-- Make key unique and add hash column

CREATE UNIQUE INDEX idx_objects_key ON objects(key);

ALTER TABLE objects ADD COLUMN hash TEXT;
