-- Migration number: 0004 	 2026-01-04T23:21:01.969Z


CREATE TABLE objects_new (
    id INTEGER PRIMARY KEY NOT NULL,
    key VARCHAR(100) NOT NULL,
    source_id INTEGER NOT NULL,
    date_created INTEGER NOT NULL,
    lat REAL,
    lng REAL,
    FOREIGN KEY (source_id) REFERENCES sources(id)
);

INSERT INTO objects_new SELECT * FROM objects;
DROP TABLE objects;
ALTER TABLE objects_new RENAME TO objects;