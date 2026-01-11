CREATE TABLE IF NOT EXISTS pending_rename_candidates (
  object_id INTEGER NOT NULL,
  candidate_id INTEGER NOT NULL,
  source_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (object_id, candidate_id),
  FOREIGN KEY (object_id) REFERENCES objects(id),
  FOREIGN KEY (candidate_id) REFERENCES objects(id),
  FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE INDEX IF NOT EXISTS pending_rename_candidates_candidate_id ON pending_rename_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS pending_rename_candidates_source_id ON pending_rename_candidates(source_id);
