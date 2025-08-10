# Project Structure

## Root Level
- `src/` - All source code
- `public/` - Static assets (icon.png, splash.png)
- `scripts/` - Build and deployment scripts
- `.kiro/` - Kiro configuration and steering rules
- Configuration files at root level

## Source Organization (`src/`)

### App Directory (`src/app/`)
Next.js App Router structure:
- `page.tsx` - Main application page
- `layout.tsx` - Root layout with providers
- `globals.css` - Global styles
- `providers.tsx` - React context providers
- `app.tsx` - Main app component

### API Routes (`src/app/api/`)
- `best-friends/` - Social graph endpoints
- `opengraph-image/` - Dynamic OG image generation
- `send-notification/` - Push notification handling
- `users/` - User data endpoints
- `webhook/` - Farcaster webhook handling

### Special Routes
- `.well-known/farcaster.json/` - Farcaster manifest
- `share/[fid]/` - Dynamic sharing pages

### Components (`src/components/`)
- `ui/` - Reusable UI components (Button, Header, Footer, etc.)
- `providers/` - React context providers (WagmiProvider)
- `Demo.tsx` - Main demo component

### Library (`src/lib/`)
Utility modules:
- `auth.ts` - Authentication helpers
- `constants.ts` - App configuration constants
- `kv.ts` - Key-value store utilities
- `neynar.ts` - Neynar API integration
- `notifs.ts` - Notification utilities
- `utils.ts` - General utilities
- `truncateAddress.ts` - Address formatting

## Naming Conventions
- **Components**: PascalCase (e.g., `Button.tsx`, `WagmiProvider.tsx`)
- **Utilities**: camelCase (e.g., `auth.ts`, `truncateAddress.ts`)
- **API Routes**: kebab-case directories with `route.ts`
- **Pages**: `page.tsx` in directory structure

## Import Patterns
- Use `~/` alias for src imports: `import { auth } from "~/lib/auth"`
- Relative imports for same-level files
- Group imports: external packages, then internal modules