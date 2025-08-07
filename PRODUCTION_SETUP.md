# Production Setup Guide

This guide explains how to set up the ZK Unbanked Demo for production with real Self Protocol verification.

## 🚀 Quick Production Setup

### 1. Environment Configuration

Create environment files:

**Frontend (`.env.local`):**

```bash
# Self Protocol Configuration
NEXT_PUBLIC_SELF_APP_NAME="ZK Identity for the Unbanked"
NEXT_PUBLIC_SELF_SCOPE="zk-unbanked-demo"
NEXT_PUBLIC_SELF_ENDPOINT="https://your-backend-domain.com/api/verify"

# API Configuration
NEXT_PUBLIC_API_URL="https://your-backend-domain.com"

# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=44787  # Celo Testnet
NEXT_PUBLIC_NETWORK="celoTestnet"

# Contract Addresses (update after deployment)
NEXT_PUBLIC_UNBANKED_IDENTITY_CONTRACT="your-identity-contract-address"
NEXT_PUBLIC_COMMUNITY_AIRDROP_CONTRACT="your-airdrop-contract-address"
NEXT_PUBLIC_GOVERNANCE_CONTRACT="your-governance-contract-address"
NEXT_PUBLIC_LENDING_CONTRACT="your-lending-contract-address"
NEXT_PUBLIC_DEMO_TOKEN_CONTRACT="your-token-contract-address"
NEXT_PUBLIC_SELF_HUB_CONTRACT="0x68c931C9a534D37aa78094877F46fE46a49F1A51"

# Mode Configuration
NEXT_PUBLIC_SELF_MOCK_MODE="false"  # Set to false for production
```

**Backend (`.env`):**

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Self Protocol Configuration
SELF_SCOPE="zk-unbanked-demo"
SELF_ENDPOINT="https://your-backend-domain.com/api/verify"
SELF_MOCK_MODE=false  # Set to false for production

# API Configuration
API_URL="https://your-backend-domain.com"
FRONTEND_URL="https://your-frontend-domain.com"

# Security
JWT_SECRET="your-strong-secret-key-here"

# Blockchain Configuration
CHAIN_ID=44787
RPC_URL="https://alfajores-forno.celo-testnet.org"
```

**Contracts (`.env`):**

```bash
# Network Configuration
CELO_TESTNET_RPC="https://alfajores-forno.celo-testnet.org"
CELO_MAINNET_RPC="https://forno.celo.org"

# Deployment Configuration
PRIVATE_KEY="your-private-key-without-0x-prefix"

# Block Explorer API Keys
CELOSCAN_API_KEY="your-celoscan-api-key"

# Self Protocol Configuration
SELF_HUB_TESTNET="0x68c931C9a534D37aa78094877F46fE46a49F1A51"
SELF_HUB_MAINNET="0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF"
```

### 2. Deploy Smart Contracts

```bash
# Install dependencies
cd contracts && npm install

# Deploy to Celo Testnet
npm run deploy:testnet

# The deployment will output contract addresses - save these!
```

### 3. Update Configuration

After deployment, update your frontend `.env.local` with the deployed contract addresses.

### 4. Deploy Backend

```bash
# Install dependencies
cd backend && npm install

# Build
npm run build

# Deploy to your cloud provider (Railway, Heroku, etc.)
# Make sure your backend URL is publicly accessible (not localhost)
```

### 5. Deploy Frontend

```bash
# Install dependencies
cd frontend && npm install

# Build
npm run build

# Deploy to Vercel, Netlify, or your preferred platform
```

## 🔧 Key Differences: Mock vs Production

### Mock Mode (Development)

- `SELF_MOCK_MODE=true`
- Simulates passport verification
- No real biometric data required
- Good for testing and demos

### Production Mode

- `SELF_MOCK_MODE=false`
- Requires real Self app and passport
- Users must have Self app installed
- Real zero-knowledge proofs generated

## 📱 Self App Requirements

For production use, users need:

1. **Self app** installed on their phone
2. **NFC-enabled smartphone**
3. **Valid passport** for verification
4. **Internet connection**

## 🔐 Security Considerations

### Production Checklist

- [ ] Change all default secrets and keys
- [ ] Use HTTPS for all endpoints
- [ ] Enable proper CORS settings
- [ ] Set up proper logging and monitoring
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API endpoints
- [ ] Set up backup and recovery procedures

### Smart Contract Security

- [ ] Verify contracts on block explorer
- [ ] Set up multi-sig for contract ownership
- [ ] Implement proper access controls
- [ ] Monitor contract activity
- [ ] Have emergency pause mechanisms

## 🌐 Network Configuration

### Celo Testnet (Recommended for testing)

- Chain ID: 44787
- RPC: https://alfajores-forno.celo-testnet.org
- Faucet: https://faucet.celo.org/alfajores
- Explorer: https://alfajores.celoscan.io

### Celo Mainnet (Production)

- Chain ID: 42220
- RPC: https://forno.celo.org
- Explorer: https://celoscan.io

## 🎯 Testing Production Setup

1. **Deploy to staging environment first**
2. **Test with real Self app verification**
3. **Verify all contract interactions work**
4. **Test the complete user flow**
5. **Monitor gas costs and performance**

## 🚨 Troubleshooting

### Common Issues

**"Scope mismatch" error:**

- Ensure frontend and backend use the same `SELF_SCOPE`
- Check that endpoint URLs match exactly

**"Configuration mismatch":**

- Verify verification requirements match between frontend and backend
- Check `minimumAge`, `excludedCountries`, `ofac` settings

**"Verification failed":**

- Check if Self app is installed and updated
- Ensure passport is NFC-capable
- Verify network connectivity

**Contract interaction fails:**

- Check contract addresses are correct
- Verify network configuration
- Ensure sufficient gas and token balance

### Getting Help

- Check [Self Protocol docs](https://docs.self.xyz)
- Review contract verification on block explorer
- Check backend logs for detailed error messages
- Test with mock mode first to isolate issues

## 📈 Monitoring and Analytics

### Recommended Monitoring

- **API response times and errors**
- **Contract gas usage**
- **User verification success rates**
- **Token distribution metrics**
- **Reputation system activity**

### Key Metrics

- Total verified users
- Successful verification rate
- Average reputation scores
- Loan default rates
- Governance participation

---

**Ready to go live?** Make sure to test thoroughly with the Self app before launching to users!
