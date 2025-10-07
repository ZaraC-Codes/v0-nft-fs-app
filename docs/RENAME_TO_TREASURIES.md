# Quick Rename Guide: Groups → Treasuries

Due to the complexity of renaming across many files, here's a comprehensive guide for the renaming:

## Files/Folders to Rename:

### 1. Folders
- `app/groups/` → `app/treasuries/`
- `app/groups/[groupId]/` → `app/treasuries/[treasuryId]/`
- `app/api/group/` → `app/api/treasury-group/`
- `components/group/` → `components/treasury/`

### 2. Files
- `components/group/create-group-modal.tsx` → `components/treasury/create-treasury-modal.tsx`
- `components/group/proposal-vote-card.tsx` → `components/treasury/proposal-vote-card.tsx`

### 3. Text Replacements Needed:

**In all files:**
- "Groups" → "Treasuries"
- "Group" → "Treasury"
- "group" → "treasury"
- "/groups" → "/treasuries"
- "[groupId]" → "[treasuryId]"
- "groupId" → "treasuryId"
- "CreateGroupModal" → "CreateTreasuryModal"
- "GroupsPage" → "TreasuriesPage"
- "create-group-modal" → "create-treasury-modal"

**Keep these unchanged:**
- `GroupTreasuryNFT` (smart contract name)
- `GroupTreasuryManager` (smart contract name)
- `GroupChatRelay` (smart contract name)
- `group-treasury.ts` (lib file)
- Any actual "group" references in context of "group of people"

## Why Keep Smart Contract Names?

The smart contracts are already deployed or will be deployed with these names. Changing contract names would require redeployment. The contracts are about "Group Treasuries" which makes sense.

## Recommended Approach:

Since I cannot easily do folder renames and bulk text replacement in this environment, I recommend you do a **Find & Replace** in your IDE:

1. Find: `/groups` Replace: `/treasuries`
2. Find: `"Groups"` Replace: `"Treasuries"`
3. Find: `"Group"` (in UI context) Replace: `"Treasury"`
4. Find: `GroupsPage` Replace: `TreasuriesPage`
5. Find: `CreateGroupModal` Replace: `CreateTreasuryModal`
6. Find: `groupId` Replace: `treasuryId`
7. Find: `[groupId]` Replace: `[treasuryId]`

Then manually rename folders:
- `app/groups` → `app/treasuries`
- `components/group` → `components/treasury`
- `app/api/group` → `app/api/treasury-group`

## Alternative: I Can Create New Files

Would you like me to:
1. Create new properly-named files with all corrections?
2. You can then delete the old files?

This might be cleaner than trying to rename in this environment.
