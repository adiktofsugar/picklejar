-- Migration number: 0001 	 2025-12-30T08:11:50.682Z

CREATE TABLE sources (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    kind VARCHAR(100),
    s3_endpoint VARCHAR(250),
    s3_region VARCHAR(100),
    s3_bucket VARCHAR(250),
    s3_api_key VARCHAR(100),
    s3_api_key_secret VARCHAR(100)
);

CREATE TABLE objects (
    id INTEGER PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    source_id INT,
    date_created INT,
    lat DECIMAL(8,6),
    lng DECIMAL(9,6),
    FOREIGN KEY (source_id) REFERENCES sources(id)
);
