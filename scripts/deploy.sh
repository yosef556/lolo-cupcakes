#!/bin/bash
set -e

echo "========================================================"
echo "🧁 Lolo Cupcakes - 24/7 Free Cloud Deployment Helper"
echo "========================================================"

# Automatically navigate to project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Check if git remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "Adding remote origin for user yosef556..."
    git remote add origin git@github.com:yosef556/lolo-cupcakes.git
fi

echo "Remote origin is: $(git remote get-url origin)"

echo ""
echo "Attempting to push to GitHub (branch: main)..."
if git push -u origin main; then
    echo "✅ Successfully pushed codebase to GitHub!"
else
    echo "⚠️ Push failed. Please make sure the repository 'lolo-cupcakes' exists on GitHub under your account (yosef556)."
    echo "👉 You can create it in 5 seconds here: https://github.com/new (Name: lolo-cupcakes)"
    exit 1
fi

echo ""
echo "========================================================"
echo "🚀 NEXT STEPS FOR 100% FREE 24/7 HOSTING:"
echo "========================================================"
echo "1. Backend & Database on Render (Free Forever):"
echo "   Open this 1-click link to auto-deploy backend + postgres:"
echo "   👉 https://render.com/deploy?repo=https://github.com/yosef556/lolo-cupcakes"
echo ""
echo "2. Frontend on Vercel (Free Forever):"
echo "   Open this 1-click link to import and deploy the frontend:"
echo "   👉 https://vercel.com/new/import?s=https://github.com/yosef556/lolo-cupcakes"
echo "   (Root Directory: frontend)"
echo "   (Set Environment Variable: NEXT_PUBLIC_API_URL = https://your-backend-name.onrender.com/api/v1)"
echo "========================================================"
