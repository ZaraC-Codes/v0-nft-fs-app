# Adding Treasuries Tab to Profile - Implementation Guide

## ✅ What's Already Done:

1. **Navigation Updated**
   - Header now says "Treasuries" instead of "Groups"
   - Links to `/treasuries`

2. **New Treasuries Discovery Page Created**
   - File: `app/treasuries/page.tsx`
   - Renamed from "Groups" to "Treasuries" throughout
   - Ready to use!

3. **Profile Button Removed**
   - Removed the old "Create Group" button from profile header
   - Will add to Treasuries tab instead

## 🔨 What Needs to Be Done:

### 1. Add Treasuries Tab to Profile

**File to Edit**: `components/profile/profile-tabs.tsx`

**Add to TabsList** (around line 200):
```tsx
<TabsTrigger value="treasuries" className="flex items-center gap-2">
  <Vault className="h-4 w-4" />
  <span>Treasuries</span>
</TabsTrigger>
```

**Add TabsContent** (around line 700):
```tsx
<TabsContent value="treasuries" className="space-y-6">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-lg font-semibold">Your Treasury Groups</h3>
      <p className="text-sm text-muted-foreground">
        Collaborative NFT portfolios you're part of
      </p>
    </div>

    <Button
      onClick={() => setCreateTreasuryModalOpen(true)}
      className="bg-gradient-to-r from-green-500 to-emerald-600"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Treasury
    </Button>
  </div>

  {/* Treasury Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {mockTreasuries.map((treasury) => (
      <Card
        key={treasury.id}
        className="cursor-pointer hover:border-primary/50 transition-all"
        onClick={() => router.push(`/treasuries/${treasury.id}`)}
      >
        {/* Treasury Card Content */}
      </Card>
    ))}
  </div>

  {mockTreasuries.length === 0 && (
    <Card className="p-12 text-center">
      <Vault className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Treasuries Yet</h3>
      <p className="text-muted-foreground mb-4">
        Create or join a treasury group to start collaborating
      </p>
      <Button
        onClick={() => setCreateTreasuryModalOpen(true)}
        className="bg-gradient-to-r from-primary to-secondary"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Treasury
      </Button>
    </Card>
  )}
</TabsContent>
```

**Add State** (top of component):
```tsx
const [createTreasuryModalOpen, setCreateTreasuryModalOpen] = useState(false)
```

**Add Import**:
```tsx
import { CreateTreasuryModal } from "@/components/treasury/create-treasury-modal"
import { useRouter } from "next/navigation"
```

**Add Modal at Bottom**:
```tsx
<CreateTreasuryModal
  isOpen={createTreasuryModalOpen}
  onClose={() => setCreateTreasuryModalOpen(false)}
  onSuccess={(treasuryId) => router.push(`/treasuries/${treasuryId}`)}
/>
```

### 2. Update ProfileTab Type

**File to Edit**: `types/profile.ts`

Add "treasuries" to ProfileTab union:
```tsx
export type ProfileTab =
  | "portfolio"
  | "collected"
  | "created"
  | "listings"
  | "watchlist"
  | "followers"
  | "following"
  | "treasuries" // <-- ADD THIS
```

### 3. Create Rename Component Files

**Need to rename/create**:
- `components/treasury/create-treasury-modal.tsx` (copy from create-group-modal, rename all)
- `components/treasury/proposal-vote-card.tsx` (copy from group/, rename all)

**Or simply:**
1. Copy `components/group/` folder
2. Rename to `components/treasury/`
3. Find & Replace in those files:
   - "Group" → "Treasury"
   - "group" → "treasury"
   - "Groups" → "Treasuries"

### 4. Update API Routes (Optional for Now)

The API routes at `app/api/group/` can work as-is for now. When ready to rename:
- `app/api/group/` → `app/api/treasury-group/`
- Update imports in pages that use them

### 5. Mock Data for Treasury Tab

Add mock treasury data to show in profile:
```tsx
const mockTreasuries = [
  {
    id: "1",
    name: "BAYC Legends",
    memberCount: 8,
    totalValue: 2450.8,
    role: "creator",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=1",
  },
]
```

## 📋 Quick Implementation Steps:

1. **Copy component folders** (easiest approach):
   ```
   components/group/ → components/treasury/
   ```

2. **Do Find & Replace in components/treasury/**:
   - "Group" → "Treasury"
   - "group" → "treasury"
   - "Groups" → "Treasuries"

3. **Add Treasuries tab to ProfileTabs component** (see code above)

4. **Update types/profile.ts** to include "treasuries" tab

5. **Test**:
   - Visit profile page
   - Click "Treasuries" tab
   - Click "Create Treasury" button
   - Should open modal

## 🎯 Result:

Users will see:
- **New "Treasuries" tab** on their profile
- **List of treasuries** they're part of
- **"Create Treasury" button** prominently displayed in the tab
- **Easy navigation** to individual treasury pages

## 💡 Why This Approach is Better:

✅ **Natural Discovery** - Users see their treasuries when viewing their profile
✅ **Contextual Action** - Create button is where treasuries are displayed
✅ **Clean UI** - Not cluttering the profile header with too many buttons
✅ **Organized** - Treasuries grouped with other profile content (portfolio, listings, etc.)

---

**Note**: The `/treasuries` discovery page is already complete and working! This adds a second, more profile-centric way to access the same functionality.
