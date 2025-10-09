-- Add telegram and github social link columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github TEXT;
