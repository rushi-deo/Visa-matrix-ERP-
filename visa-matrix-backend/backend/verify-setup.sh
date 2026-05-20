#!/bin/bash
# Verification script to confirm admin setup is complete

echo "🔍 Verifying Admin User Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (NOT FOUND)"
        return 1
    fi
}

echo "📁 Checking files..."
echo ""

FILES=(
    "backend/seed-admin.js"
    "backend/ADMIN_SETUP.md"
    "backend/ADMIN_SEED.md"
    "backend/TESTING_GUIDE.md"
    "backend/AUTHENTICATION_SETUP.md"
    "backend/SETUP_SUMMARY.md"
    "backend/supabase/migrations/20260518_create_profiles_table.sql"
)

MISSING=0
for file in "${FILES[@]}"; do
    if ! check_file "$file"; then
        ((MISSING++))
    fi
done

echo ""
echo "📋 Checking npm script..."

if grep -q '"seed:admin"' backend/package.json; then
    echo -e "${GREEN}✓${NC} npm run seed:admin script found"
else
    echo -e "${RED}✗${NC} npm run seed:admin script NOT found"
    ((MISSING++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ All setup files verified!${NC}"
    echo ""
    echo "📖 Next steps:"
    echo "   1. Apply database migration:"
    echo "      supabase db push"
    echo ""
    echo "   2. Seed the admin user:"
    echo "      cd backend && npm run seed:admin"
    echo ""
    echo "   3. Start the server:"
    echo "      npm run dev"
    echo ""
    echo "   4. Test login:"
    echo "      curl -X POST http://localhost:3000/auth/login \\"
    echo "        -H 'Content-Type: application/json' \\"
    echo "        -d '{\"email\":\"admin@visamatrix.com\",\"password\":\"admin123\"}'"
    echo ""
    echo "📚 For detailed guides, read:"
    echo "   - backend/ADMIN_SETUP.md (quick reference)"
    echo "   - backend/TESTING_GUIDE.md (test examples)"
    echo "   - backend/AUTHENTICATION_SETUP.md (full architecture)"
else
    echo -e "${RED}❌ Setup incomplete - $MISSING file(s) missing${NC}"
    echo ""
    echo "⚠️  Please ensure all files are present before proceeding."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
