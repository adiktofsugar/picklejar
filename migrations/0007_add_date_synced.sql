-- Migration number: 0007 	 2026-01-05
-- Add date_synced column to objects and sources

ALTER TABLE objects ADD COLUMN date_synced INTEGER;

ALTER TABLE sources ADD COLUMN date_synced INTEGER;
