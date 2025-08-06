# Contributing to ZK Identity for the Unbanked

Thank you for your interest in contributing! This project aims to provide financial inclusion through privacy-preserving identity verification.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/zk-unbanked-demo.git
   cd zk-unbanked-demo
   ```
3. **Install dependencies:**
   ```bash
   npm run setup
   ```
4. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🏗️ Development Workflow

1. **Start the development environment:**

   ```bash
   npm run dev
   ```

2. **Make your changes:**

   - Frontend: Edit files in `frontend/`
   - Backend: Edit files in `backend/src/`
   - Contracts: Edit files in `contracts/contracts/`

3. **Test your changes:**

   - Visit http://localhost:3000
   - Test the identity verification flow
   - Verify reputation system works
   - Check financial service access

4. **Commit your changes:**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create a PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Code Style

- **TypeScript/JavaScript**: Use Prettier and ESLint
- **Solidity**: Follow Solidity style guide
- **React**: Use functional components with hooks
- **Naming**: Use descriptive names for variables and functions

## 🧪 Testing

- Test all user flows manually
- Ensure contracts compile without warnings
- Verify environment variables work correctly
- Test both mock and production modes

## 💡 Areas for Contribution

### High Priority

- **Mobile responsiveness** improvements
- **Accessibility (a11y)** enhancements
- **Error handling** improvements
- **Loading states** and UX polish

### Medium Priority

- **Additional financial services** (savings groups, insurance)
- **Multi-language support** (i18n)
- **Advanced reputation algorithms**
- **Cross-chain compatibility**

### Advanced

- **Layer 2 integration** (Polygon, Arbitrum)
- **IPFS integration** for metadata
- **Advanced ZK circuits**
- **Governance mechanisms**

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Console errors**

## 💬 Questions?

- Create an issue for technical questions
- Join our community discussions
- Check existing issues and PRs first

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
