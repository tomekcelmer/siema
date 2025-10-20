/*
  # Add instructions_read flag to participants table

  1. Changes
    - Add `instructions_read` boolean column to participants table
    - Default value is false
    - This field tracks whether a participant has read instructions and entered declared price
    - Prevents race conditions in Page4->Page5 transition

  2. Security
    - No changes to RLS policies (already permissive for all operations)
*/

-- Add instructions_read column to participants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'participants' AND column_name = 'instructions_read'
  ) THEN
    ALTER TABLE participants
    ADD COLUMN instructions_read BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
