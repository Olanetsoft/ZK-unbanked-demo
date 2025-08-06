# ZK Identity for the Unbanked

Privacy-preserving identity system enabling financial inclusion for 1+ billion unbanked people globally using Self Protocol's zero-knowledge verification.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))
- **Metamask** or compatible Web3 wallet

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd zk-unbanked-demo

# Install all dependencies (frontend, backend, contracts)
npm run setup
```

### 2. Environment Setup

Create environment files with the provided templates:

**Frontend (.env.local):**

```bash
cd frontend
cp .env.example .env.local
```

**Backend (.env):**

```bash
cd backend
cp .env.example .env
```

**Contracts (.env):**

```bash
cd contracts
cp .env.example .env
# Add your private key for testnet deployment (optional)
```

### 3. Start Development

```bash
# Start frontend and backend together
npm run dev

# Or start individually:
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

### 4. Deploy Contracts (Optional)

```bash
# Deploy to local hardhat network
npm run deploy:local

# Deploy to Celo testnet (requires PRIVATE_KEY in contracts/.env)
npm run deploy:testnet
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend     │    │   Blockchain    │
│  (Next.js 14)  │◄──►│  (Express API)  │◄──►│  (Celo Testnet) │
│                 │    │                 │    │                 │
│ • React + TS    │    │ • Self Protocol │    │ • Smart         │
│ • Three.js      │    │ • Identity API  │    │   Contracts     │
│ • Framer Motion │    │ • Reputation    │    │ • ZK Proofs     │
│ • Tailwind CSS  │    │ • Mock Services │    │ • Token System  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Three.js, Framer Motion, Tailwind CSS
- **Backend**: Node.js, Express, Self Protocol SDK (@selfxyz/core)
- **Smart Contracts**: Solidity 0.8.28, Hardhat, Self Protocol integration
- **Blockchain**: Celo (mobile-first, low-cost transactions)

## ✨ Features

### Core Identity System

- **Zero-knowledge identity verification** via Self Protocol
- **Privacy-preserving nullifiers** (no personal data stored)
- **Sybil resistance** (one identity per person)
- **Cross-platform compatibility** (works on mobile)

### Financial Services

- **Anonymous microloans** based on reputation
- **Community airdrops** with ZK eligibility
- **Governance participation** with privacy
- **Cross-border remittances** (planned)

### Reputation System

- **Community attestations** from local leaders
- **Trust scoring** without revealing identity
- **Service eligibility** based on reputation
- **Transparent verification** via blockchain

## 🔧 Development Guide

### Project Structure

```
zk-unbanked-demo/
├── frontend/           # Next.js application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   └── lib/           # Utilities and configs
├── backend/           # Express.js API server
│   └── src/           # Source code
├── contracts/         # Smart contracts
│   ├── contracts/     # Solidity files
│   ├── scripts/       # Deployment scripts
│   └── deployments/   # Contract addresses
└── package.json       # Root package file
```

### Environment Variables

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_SELF_ENDPOINT=https://stage.self.id/api/v2/request
NEXT_PUBLIC_SELF_SCOPE=zk-unbanked-demo
NEXT_PUBLIC_SELF_APP_NAME=ZK Identity for the Unbanked
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=44787
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed-contract-address>
NEXT_PUBLIC_AIRDROP_CONTRACT=<airdrop-contract-address>
NEXT_PUBLIC_TOKEN_CONTRACT=<token-contract-address>
NEXT_PUBLIC_SELF_HUB=0x68c931C9a534D37aa78094877F46fE46a49F1A51
NEXT_PUBLIC_NETWORK=celoTestnet
```

#### Backend (.env)

```bash
PORT=3001
SELF_MOCK_MODE=true
SELF_SCOPE=zk-unbanked-demo
DATABASE_URL=mongodb://localhost:27017/zk-unbanked
JWT_SECRET=your-secret-key-change-this
```

#### Contracts (.env)

```bash
CELO_TESTNET_RPC=https://alfajores-forno.celo-testnet.org
CELO_MAINNET_RPC=https://forno.celo.org
PRIVATE_KEY=your-private-key-for-deployment
CELOSCAN_API_KEY=your-celoscan-api-key
```

### Available Scripts

```bash
# Development
npm run dev                 # Start frontend + backend
npm run dev:frontend        # Frontend only (port 3000)
npm run dev:backend         # Backend only (port 3001)
npm run dev:contracts       # Local blockchain node

# Building
npm run build              # Build all components
npm run build:frontend     # Build frontend only
npm run build:backend      # Build backend only

# Deployment
npm run deploy:local       # Deploy to local network
npm run deploy:testnet     # Deploy to Celo testnet

# Setup
npm run setup             # Install all dependencies
```

## 🧪 Testing the System

1. **Start the development environment:**

   ```bash
   npm run dev
   ```

2. **Visit http://localhost:3000**

3. **Test the demo flow:**
   - Click "Verify Your Identity"
   - Complete Self Protocol verification (or use mock mode)
   - Build reputation through community attestations
   - Access financial services based on reputation

### Demo Accounts

- The system uses **mock mode** by default for testing
- Real Self Protocol verification available in production mode
- Switch `SELF_MOCK_MODE=false` in backend/.env for real verification

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy to Vercel, Netlify, or your preferred platform
```

### Backend (Railway, Heroku, etc.)

```bash
cd backend
npm run build
# Deploy to your preferred cloud platform
```

### Smart Contracts (Celo Testnet)

```bash
cd contracts
# Add PRIVATE_KEY to .env
npm run deploy:testnet
# Update frontend .env.local with new contract addresses
```

## 📊 Contract Addresses (Celo Testnet)

- **UnbankedIdentity**: `0x8843ddc7021154Bb77283c5122bcc4E199A7e22E`
- **CommunityAirdrop**: `0xb15CC4Fe3eFC957F6A48e6c7493281aBe76ed94a`
- **Demo Token**: `0x6be60B6DE9adAc380bFb0F3D649BE967574D2F68`
- **Self Hub**: `0x68c931C9a534D37aa78094877F46fE46a49F1A51`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**"Module not found" errors:**

```bash
rm -rf node_modules package-lock.json
npm run setup
```

**Contract deployment fails:**

- Check your private key in `contracts/.env`
- Ensure sufficient CELO balance for gas fees
- Verify RPC endpoint is accessible

**Frontend won't load:**

- Check if backend is running on port 3001
- Verify environment variables in `.env.local`
- Clear browser cache and restart dev server

**Self Protocol verification fails:**

- Ensure `SELF_MOCK_MODE=true` for testing
- Check Self Protocol service status
- Verify API endpoints in environment variables

### Getting Help

- **Issues**: Create an issue on GitHub
- **Documentation**: Check [Self Protocol Docs](https://docs.self.id)
- **Community**: Join our Discord/Telegram (links coming soon)

---

Built with ❤️ for financial inclusion and powered by [Self Protocol](https://self.id)
