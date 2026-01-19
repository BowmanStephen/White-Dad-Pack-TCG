# Migration 3 Quick Reference

## Summary
✅ **Status:** Complete  
📍 **File:** `src/lib/utils/migrations.ts`  
🔢 **Version:** 3  
📅 **Created:** Jan 17, 2026  

## Changes Made

### 1. Version Update (Line 22)
```typescript
export const CURRENT_SCHEMA_VERSION = 3;
```

### 2. Migration Function (Lines 131-235)
- **Function name:** `migration_3_add_card_type_support`
- **Type:** `MigrationFn` (no-arg function returning transformed data)

### 3. Registry Entry (Lines 256-259)
- **Version:** 3
- **Migration function:** `migration_3_add_card_type_support`

## What It Does

### Type Conversions (15 mappings)
```
BBQ_DAD → BBQ_DICKTATOR
FIX_IT_DAD → FIX_IT_TECHNICIAN
GOLF_DAD → GOLF_COMMANDER
COUCH_DAD → COUCH_CUMMANDER
LAWN_DAD → LAWN_LIEUTENANT
CAR_DAD → CAR_CAPTAIN
OFFICE_DAD → OFFICE_OPERATIVE
COOL_DAD → COOL_CATALYST
COACH_DAD → COACH_COMMANDER
CHEF_DAD → CHEF_OVERLORD
HOLIDAY_DAD → HOLIDAY_HOST
WAREHOUSE_DAD → WAREHOUSE_WARDEN
VINTAGE_DAD → VINTAGE_VOYAGER
FASHION_DAD → FASHION_FUHRER
TECH_DAD → TECH_TITAN
```

### New Attributes (per card)
- `effects: []` - Empty array for future effects
- `cardAttributes: { isSpecialType: boolean, specialTypeInfo: null | {...} }`

### Special Types
For cards with type: `ITEM`, `EVENT`, `TERRAIN`, `EVOLUTION`, `CURSE`, `TRAP`
- Sets `isSpecialType = true`
- Initializes `specialTypeInfo` with metadata

## Key Features

✅ **Idempotent** - Safe to run multiple times  
✅ **Type safe** - Uses Record<string, string> mapping  
✅ **Null safe** - Checks before accessing/modifying  
✅ **Backward compatible** - Fallback for unmapped types  
✅ **Non-destructive** - Doesn't remove existing data  

## Testing

Run on:
- ✅ Empty collections (no cards)
- ✅ Old collections (v1, v2)
- ✅ Mixed collections
- ✅ Corrupted data
- ✅ Multiple runs (idempotent)

## Automatic Execution

Migration runs automatically when:
1. Loading collection from localStorage
2. Importing collection backup
3. Collection version < 3

No manual trigger needed!

## Code Locations

| Item | Lines | Description |
|------|-------|-------------|
| Version | 22 | Schema version constant |
| Function | 131-235 | Migration implementation |
| Type mapping | 140-177 | DICKTATOR naming conversions |
| Card migration | 179-232 | Iterate and transform cards |
| Registry | 256-259 | Add to MIGRATIONS array |

## For Developers

When adding new migrations (v4+):
1. Create `migration_4_*` function
2. Add to MIGRATIONS array
3. Increment CURRENT_SCHEMA_VERSION
4. Maintain idempotency pattern

When updating card types:
1. Update typeMapping in this migration if new types added
2. Add new special types to specialTypes array
3. Ensure backwards compatibility

---

**Verification:**
```bash
grep -n "CURRENT_SCHEMA_VERSION = 3" src/lib/utils/migrations.ts
grep -n "migration_3_add_card_type_support" src/lib/utils/migrations.ts
grep -n "version: 3" src/lib/utils/migrations.ts
```

**Status:** Ready for production ✅
