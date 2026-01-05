-- Migration number: 0003 	 2026-01-04T22:20:06.581Z

CREATE TABLE objects_new (
    id INTEGER PRIMARY KEY NOT NULL,
    key VARCHAR(100) NOT NULL,
    source_id INTEGER NOT NULL,
    date_created INTEGER,
    lat REAL,
    lng REAL,
    FOREIGN KEY (source_id) REFERENCES sources(id)
);

INSERT INTO objects_new SELECT * FROM objects;
DROP TABLE objects;
ALTER TABLE objects_new RENAME TO objects;


CREATE TABLE sources_new (
    id INTEGER PRIMARY KEY NOT NULL,
    name VARCHAR(100) NOT NULL,
    kind VARCHAR(100) NOT NULL,
    s3_endpoint VARCHAR(250),
    s3_region VARCHAR(100),
    s3_bucket VARCHAR(250),
    s3_api_key VARCHAR(100),
    s3_api_key_secret VARCHAR(100)
);

INSERT INTO sources_new SELECT * FROM sources;
DROP TABLE sources;
ALTER TABLE sources_new RENAME TO sources;