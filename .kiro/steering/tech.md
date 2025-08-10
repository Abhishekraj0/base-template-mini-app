# Tech Stack

## Core Framework
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Node.js** runtime with ES modules

## Farcaster Integration
- `@farcaster/auth-client` - Authentication
- `@farcaster/auth-kit` - Auth UI components
- `@farcaster/frame-core` - Core frame functionality
- `@farcaster/frame-node` - Server-side frame handling
- `@farcaster/frame-sdk` - Client SDK
- `@farcaster/frame-wagmi-connector` - Wallet integration
- `@neynar/nodejs-sdk` - Neynar API client
- `@neynar/react` - React components for Neynar

## Blockchain & Wallet
- **Wagmi** - Ethereum integration
- **Viem** - Ethereum client library

## UI & Styling
- **Tailwind CSS** - Utility-first styling with custom design system
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Class Variance Authority** - Component variant management

## Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- `@supabase/supabase-js` - Supabase client library

## Development Tools
- **TypeScript** - Type safety
- **ESLint** - Code linting with Next.js config
- **Zod** - Runtime type validation

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run cleanup      # Kill processes on port 3000

# Build & Deploy
npm run build        # Production build
npm run start        # Start production server
npm run deploy:vercel # Deploy to Vercel

# Code Quality
npm run lint         # Run ESLint
```

## Path Aliases
- `~/` maps to `./src/` for cleaner imports