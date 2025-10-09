-- User profiles table (supports multiple OAuth providers and email)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT, -- Nullable because some OAuth providers don't provide email
  username TEXT UNIQUE NOT NULL,
  avatar TEXT,
  bio TEXT,
  banner_image TEXT,
  twitter TEXT,
  instagram TEXT,
  discord TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth accounts table (one-to-many: user can link multiple OAuth providers)
CREATE TABLE IF NOT EXISTS profile_oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'facebook', 'twitter', 'discord', 'apple', etc.
  provider_account_id TEXT NOT NULL, -- Unique ID from OAuth provider (e.g., Google user ID)
  email TEXT, -- Email from this OAuth provider (may differ per provider)
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- Wallet addresses table (one-to-many: user can link multiple wallets)
CREATE TABLE IF NOT EXISTS profile_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL, -- 'embedded', 'metamask', 'walletconnect', etc.
  is_primary BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wallet_address)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profile_wallets_address ON profile_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_oauth_provider_account ON profile_oauth_accounts(provider, provider_account_id);

-- Function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
