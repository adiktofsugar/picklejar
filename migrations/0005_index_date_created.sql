-- Migration number: 0005 	 2026-01-05
CREATE INDEX idx_objects_date_created ON objects(date_created);
