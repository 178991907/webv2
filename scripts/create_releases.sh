#!/bin/bash
set -e

# Check if authenticated
if ! gh auth status &>/dev/null; then
    echo "Error: You are not logged into GitHub CLI. Run 'gh auth login' first."
    exit 1
fi

echo "Checking v1.0.0..."
if gh release view v1.0.0 &>/dev/null; then
    echo "Release v1.0.0 already exists."
else
    echo "Creating v1.0.0 Release..."
    gh release create v1.0.0 \
        --title "v1.0.0: Child-Friendly Theme System" \
        --notes "## Key Features
- **Child-Friendly Themes**: 7 distinct themes including Galaxy Explorer, Lavender Dream, and more.
- **Interactive UI**: Tooltips with layout shift and spotlight focus effects.
- **Persistence**: Hybrid storage with local preferences and admin-defined defaults."
fi

echo "Checking v2.0.0..."
if gh release view v2.0.0 &>/dev/null; then
    echo "Release v2.0.0 already exists."
else
    echo "Creating v2.0.0 Release..."
    gh release create v2.0.0 \
        --title "v2.0.0: Cloudflare Workers Deployment" \
        --notes "## Key Features
- **Cloudflare Workers**: Standalone \`_worker.js\` deployment.
- **KV Storage**: Replaced PostgreSQL with Cloudflare KV for settings and links.
- **Full Feature Set**: Includes all v1.0.0 features optimized for Edge execution.
- **Performance**: Zero-cold-start architecture with embedded assets.

## Deployment
Configure \`wrangler.toml\` with your \`KV_NAMESPACE_ID\` and \`ADMIN_PASSWORD\`."
fi

echo "Checking v3.0.0..."
if gh release view v3.0.0 &>/dev/null; then
    echo "Release v3.0.0 already exists."
else
    echo "Creating v3.0.0 Release..."
    gh release create v3.0.0 \
        --title "v3.0.0: Tooltip & UI Optimization" \
        --notes "## Key Changes
- **Universal Tooltip Visibility**: Tooltips now use a high-contrast Dark Mode theme across all site themes to ensure perfect readability.
- **UI Enhancements**: Optimized description text rendering and reduced visual clutter.
- **Version Bump**: Official Release v3.0.0." \
        --latest
fi

echo "Checking v3.0.1..."
if gh release view v3.0.1 &>/dev/null; then
    echo "Release v3.0.1 already exists."
else
    echo "Creating v3.0.1 Release..."
    gh release create v3.0.1 \
        --title "v3.0.1: Hotfix for Vercel/Next.js Tooltips" \
        --notes "## Hotfix
- **CSS Fix**: Applied universal dark tooltip styles to globally deployed Next.js/Vercel versions (previously only applied to Worker).
- Ensures consistent readability across all deployments." \
        --latest
fi

echo "✅ All releases processed successfully!"
