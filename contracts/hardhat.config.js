require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Suppress specific warnings from external libraries
const originalStderr = process.stderr.write;
process.stderr.write = function (chunk, encoding, callback) {
  const message = chunk.toString();

  // Filter out warnings from Self Protocol contracts
  if (
    message.includes("Warning: Unreachable code") ||
    message.includes("Warning: Unused function parameter") ||
    message.includes("@selfxyz/contracts") ||
    message.includes("SelfVerificationRoot.sol")
  ) {
    return true; // Don't output these warnings
  }

  return originalStderr.call(this, chunk, encoding, callback);
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },

  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },

    localhost: {
      url: "http://127.0.0.1:8545",
    },

    celoTestnet: {
      url:
        process.env.CELO_TESTNET_RPC ||
        "https://alfajores-forno.celo-testnet.org",
      chainId: 44787,
      accounts:
        process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 64
          ? [process.env.PRIVATE_KEY]
          : [],
      gas: 10000000,
      gasPrice: 50000000000, // Further increased for current network conditions
    },

    celoMainnet: {
      url: process.env.CELO_MAINNET_RPC || "https://forno.celo.org",
      chainId: 42220,
      accounts:
        process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 64
          ? [process.env.PRIVATE_KEY]
          : [],
      gas: 10000000,
      gasPrice: 10000000000,
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 10,
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
