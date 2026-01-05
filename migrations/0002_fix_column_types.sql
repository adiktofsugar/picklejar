-- Migration number: 0002 	 2026-01-04
-- Fix column types: INT -> INTEGER, DECIMAL -> REAL for proper type inference

-- Recreate objects table with correct types
CREATE TABLE objects_new (
    id INTEGER PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    source_id INTEGER,
    date_created INTEGER,
    lat REAL,
    lng REAL,
    FOREIGN KEY (source_id) REFERENCES sources(id)
);

INSERT INTO objects_new SELECT * FROM objects;
DROP TABLE objects;
ALTER TABLE objects_new RENAME TO objects;
