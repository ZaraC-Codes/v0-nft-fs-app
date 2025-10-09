-- Add privacy settings to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_wallet_address BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Follow system table (one-to-many: user can follow many users, user can be followed by many)
CREATE TABLE IF NOT EXISTS profile_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Can't follow yourself
);

-- Watchlist table (one-to-many: user can watch many collections)
CREATE TABLE IF NOT EXISTS profile_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  collection_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  collection_name TEXT,
  collection_image TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, collection_address, chain_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profile_follows_follower ON profile_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_profile_follows_following ON profile_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_profile_watchlist_profile ON profile_watchlist(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_watchlist_collection ON profile_watchlist(collection_address, chain_id);

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM profile_follows WHERE following_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM profile_follows WHERE follower_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Function to check if user is following another user
CREATE OR REPLACE FUNCTION is_following(follower UUID, following UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM profile_follows
    WHERE follower_id = follower AND following_id = following
  );
$$ LANGUAGE SQL STABLE;
