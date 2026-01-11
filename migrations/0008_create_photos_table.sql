-- Migration number: 0008 	 2026-01-06
-- Create photos table with lat/lng

CREATE TABLE photos (
    id INTEGER PRIMARY KEY,
    object_hash TEXT NOT NULL,
    lat REAL,
    lng REAL,
    FOREIGN KEY (object_hash) REFERENCES objects(hash)
);

CREATE INDEX idx_photos_object_hash ON photos(object_hash);
