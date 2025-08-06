# ZK Identity for the Unbanked

Privacy-preserving identity system enabling financial inclusion for 1+ billion unbanked people globally.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run setup
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

3. **Deploy contracts (optional):**
   ```bash
   npm run deploy:local
   ```

## Architecture

- **Frontend**: Next.js 14 with React, Three.js, and Framer Motion
- **Backend**: Node.js with Express and Self Protocol SDK
- **Smart Contracts**: Solidity with Self Protocol integration
- **Blockchain**: Celo (mobile-first blockchain)

## Features

- Zero-knowledge identity verification
- Community-based reputation system
- Anonymous microloans
- Sybil-resistant airdrops
- Private governance participation
- Cross-border remittances

## Development

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Blockchain: http://localhost:8545 (if running local node)

## Environment Variables

Update the `.env` files in each directory with your actual values before deploying to production.

## License

MIT
