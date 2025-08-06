#!/bin/bash

# ZK Identity for the Unbanked - Setup Script
# This script sets up the complete development environment

set -e  # Exit on error

echo "🚀 ZK Identity for the Unbanked - Setup Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Create project structure
echo -e "\n${BLUE}📁 Creating project structure...${NC}"

mkdir -p frontend/{app/api/verify,components/{identity,reputation,services,ui},lib,public/assets}
mkdir -p backend/src/{controllers,services,models,middleware}
mkdir -p contracts/{contracts,scripts,test}

echo -e "${GREEN}✓ Project structure created${NC}"

# Frontend setup
echo -e "\n${BLUE}🎨 Setting up frontend...${NC}"
cd frontend

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
    npm init -y > /dev/null 2>&1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install next@14.0.3 react@18.2.0 react-dom@18.2.0 \
    @selfxyz/qrcode @selfxyz/core ethers@^6.0.0 \
    framer-motion@10.16.0 clsx tailwind-merge \
    @radix-ui/react-dialog @radix-ui/react-tabs \
    @react-three/fiber@8.15.19 @react-three/drei@9.88.13 three \
    lucide-react react-hot-toast recharts \
    --save

npm install --save-dev \
    @types/node @types/react @types/react-dom @types/three \
    typescript autoprefixer postcss tailwindcss tailwindcss-animate \
    eslint eslint-config-next

echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Create essential frontend config files
echo -e "\n${BLUE}📝 Creating frontend configuration files...${NC}"

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_SELF_ENDPOINT=https://stage.self.id/api/v2/request
NEXT_PUBLIC_SELF_SCOPE=zk-unbanked-demo
NEXT_PUBLIC_SELF_APP_NAME=ZK Identity for the Unbanked
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=44787
NEXT_PUBLIC_CONTRACT_ADDRESS=
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo -e "${GREEN}✓ Frontend configuration complete${NC}"

# Backend setup
echo -e "\n${BLUE}⚙️ Setting up backend...${NC}"
cd ../backend

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
    npm init -y > /dev/null 2>&1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
npm install express cors dotenv helmet \
    @selfxyz/core ethers winston morgan \
    --save

npm install --save-dev \
    typescript @types/node @types/express \
    @types/cors nodemon ts-node

echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Create backend config files
echo -e "\n${BLUE}📝 Creating backend configuration files...${NC}"

# Create .env
cat > .env << 'EOF'
PORT=3001
SELF_MOCK_MODE=true
SELF_SCOPE=zk-unbanked-demo
DATABASE_URL=mongodb://localhost:27017/zk-unbanked
JWT_SECRET=your-secret-key-change-this
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF

# Update package.json scripts
npm pkg set scripts.dev="nodemon --watch src --ext ts --exec ts-node src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/index.js"

echo -e "${GREEN}✓ Backend configuration complete${NC}"

# Smart contracts setup
echo -e "\n${BLUE}📜 Setting up smart contracts...${NC}"
cd ../contracts

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
    npm init -y > /dev/null 2>&1
fi

# Install contract dependencies
echo "Installing smart contract dependencies..."
npm install --save-dev \
    hardhat @nomicfoundation/hardhat-toolbox \
    @openzeppelin/contracts @selfxyz/contracts \
    dotenv

echo -e "${GREEN}✓ Smart contract dependencies installed${NC}"

# Create .env
cat > .env << 'EOF'
CELO_TESTNET_RPC=https://alfajores-forno.celo-testnet.org
CELO_MAINNET_RPC=https://forno.celo.org
PRIVATE_KEY=your-private-key-here
CELOSCAN_API_KEY=your-api-key-here
EOF

echo -e "${GREEN}✓ Smart contract configuration complete${NC}"

# Create root package.json for convenience scripts
cd ..
cat > package.json << 'EOF'
{
  "name": "zk-unbanked-identity",
  "version": "1.0.0",
  "description": "ZK Identity for the Unbanked - Full Stack Demo",
  "scripts": {
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "dev:contracts": "cd contracts && npx hardhat node",
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "build": "npm run build:frontend && npm run build:backend",
    "deploy:local": "cd contracts && npx hardhat run scripts/deploy.js --network localhost",
    "deploy:testnet": "cd contracts && npx hardhat run scripts/deploy.js --network celoTestnet",
    "setup": "npm install && cd frontend && npm install && cd ../backend && npm install && cd ../contracts && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF

npm install --save-dev concurrently

# Create README with instructions
cat > README.md << 'EOF'
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
EOF

# Final summary
echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update .env files with your actual values"
echo "2. Run 'npm run dev' to start the development servers"
echo "3. Visit http://localhost:3000 to see the demo"
echo -e "\n${BLUE}Happy building! 🚀${NC}"