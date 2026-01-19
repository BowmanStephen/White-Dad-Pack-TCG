#!/bin/bash

# DadDeck™ Migration 3 Verification Script
# Run this to verify all fixes are complete

echo "════════════════════════════════════════════════════════════════"
echo "🔍 DadDeck™ Migration 3 Verification"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_build() {
    echo "${YELLOW}📦 Checking Build...${NC}"
    if bun run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Build passes${NC}"
    else
        echo -e "${RED}❌ Build fails${NC}"
        return 1
    fi
}

check_tests() {
    echo "${YELLOW}🧪 Checking Tests...${NC}"
    test_output=$(bun test 2>&1)
    if echo "$test_output" | grep -q "0 fail"; then
        pass_count=$(echo "$test_output" | grep -oP '\d+(?= pass)' | tail -1)
        echo -e "${GREEN}✅ All $pass_count tests pass${NC}"
    else
        echo -e "${RED}❌ Tests failing${NC}"
        return 1
    fi
}

check_types() {
    echo "${YELLOW}📝 Checking TypeScript...${NC}"
    errors=$(bun tsc --noEmit --skipLibCheck 2>&1 | grep -c "^src/")
    if [ "$errors" -eq 0 ]; then
        echo -e "${GREEN}✅ Zero TypeScript errors${NC}"
    else
        echo -e "${RED}❌ Found $errors TypeScript errors${NC}"
        return 1
    fi
}

check_database() {
    echo "${YELLOW}💾 Checking Database...${NC}"
    total=$(grep -c '"id":' src/data/cards.json)
    echo -e "${GREEN}✅ Database has $total cards${NC}"
    
    # Check for old types
    old_count=$(grep -c '"type": "BBQ_DAD"' src/data/cards.json 2>/dev/null || echo 0)
    if [ "$old_count" -eq 0 ]; then
        echo -e "${GREEN}✅ No old type names found${NC}"
    else
        echo -e "${RED}❌ Found $old_count old type names${NC}"
        return 1
    fi
    
    # Check for new types
    new_count=$(grep -c '"type": "BBQ_DICKTATOR"' src/data/cards.json)
    if [ "$new_count" -gt 0 ]; then
        echo -e "${GREEN}✅ Found $new_count BBQ_DICKTATOR cards${NC}"
    fi
}

check_migration() {
    echo "${YELLOW}🔄 Checking Migration System...${NC}"
    if grep -q "CURRENT_SCHEMA_VERSION = 3" src/lib/utils/migrations.ts; then
        echo -e "${GREEN}✅ Schema version is 3${NC}"
    else
        echo -e "${RED}❌ Schema version not updated${NC}"
        return 1
    fi
    
    if grep -q "migration_3_add_card_type_support" src/lib/utils/migrations.ts; then
        echo -e "${GREEN}✅ Migration 3 implemented${NC}"
    else
        echo -e "${RED}❌ Migration 3 not found${NC}"
        return 1
    fi
}

# Run all checks
echo ""
check_build && \
check_tests && \
check_types && \
check_database && \
check_migration

echo ""
echo "════════════════════════════════════════════════════════════════"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ALL VERIFICATIONS PASSED${NC}"
    echo "🚀 Ready for production deployment!"
else
    echo -e "${RED}❌ VERIFICATION FAILED${NC}"
    echo "Please review the errors above."
fi
echo "════════════════════════════════════════════════════════════════"
