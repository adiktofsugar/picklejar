-- Migration number: 0010    2026-01-08
-- Add sync_workflow_id column to track the current sync workflow

ALTER TABLE sources ADD COLUMN sync_workflow_id TEXT;
