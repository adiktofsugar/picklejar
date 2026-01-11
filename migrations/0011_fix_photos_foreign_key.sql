-- Migration number: 0011    2026-01-10
-- Fix photos table to reference object_id instead of hash, with cascade delete

DROP TABLE IF EXISTS photos;

CREATE TABLE photos (
    id INTEGER PRIMARY KEY,
    object_id INTEGER NOT NULL,
    lat REAL,
    lng REAL,
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE
);

CREATE INDEX idx_photos_object_id ON photos(object_id);
