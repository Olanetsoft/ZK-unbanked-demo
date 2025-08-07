const hre = require("hardhat");
const { ethers } = require("hardhat");

// Self Protocol Hub addresses
const SELF_HUB_ADDRESSES = {
  celoTestnet: "0x68c931C9a534D37aa78094877F46fE46a49F1A51",
  celoMainnet: "0x", // Replace with actual
  localhost: "0x0000000000000000000000000000000000000000", // Will deploy mock
};

// Configuration IDs for different verification requirements
const CONFIG_IDS = {
  basic: ethers.id("basic-verification"),
  enhanced: ethers.id("enhanced-verification"),
};

async function main() {
  console.log("🚀 Starting deployment of UnbankedIdentity system...");

  // Get the network
  const network = await hre.network.name;
  console.log(`📡 Deploying to network: ${network}`);

  // Get the deployer
  const [deployer] = await ethers.getSigners();
  console.log(`💰 Deploying contracts with account: ${deployer.address}`);
  console.log(
    `💰 Account balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} ETH`
  );

  // Get hub address for the network
  let hubAddress = SELF_HUB_ADDRESSES[network];

  // If local network, deploy a mock hub
  if (network === "localhost" || network === "hardhat") {
    console.log("📦 Deploying mock Self Hub for local testing...");
    const MockHub = await ethers.getContractFactory("MockSelfHub");
    const mockHub = await MockHub.deploy();
    await mockHub.waitForDeployment();
    hubAddress = await mockHub.getAddress();
    console.log(`✅ Mock Self Hub deployed to: ${hubAddress}`);
  }

  // Deploy UnbankedIdentity contract
  console.log("📦 Deploying UnbankedIdentity contract...");
  const UnbankedIdentity = await ethers.getContractFactory("UnbankedIdentity");

  // Generate a unique scope based on timestamp
  const scope = ethers.toBigInt(
    ethers.id("zk-unbanked-demo-" + Date.now()).slice(0, 10)
  );

  const unbankedIdentity = await UnbankedIdentity.deploy(
    hubAddress,
    scope,
    CONFIG_IDS.basic
  );

  await unbankedIdentity.waitForDeployment();
  const unbankedIdentityAddress = await unbankedIdentity.getAddress();
  console.log(`✅ UnbankedIdentity deployed to: ${unbankedIdentityAddress}`);

  // Deploy Token for airdrops (optional)
  console.log("📦 Deploying Demo Token for airdrops...");
  const DemoToken = await ethers.getContractFactory("DemoToken");
  const demoToken = await DemoToken.deploy(
    "ZK Demo Token",
    "ZKDEMO",
    ethers.parseEther("1000000")
  );
  await demoToken.waitForDeployment();
  const demoTokenAddress = await demoToken.getAddress();
  console.log(`✅ Demo Token deployed to: ${demoTokenAddress}`);

  // Deploy CommunityAirdrop contract
  console.log("📦 Deploying CommunityAirdrop contract...");
  const CommunityAirdrop = await ethers.getContractFactory(
    "UnbankedCommunityAirdrop"
  );

  const airdrop = await CommunityAirdrop.deploy(
    hubAddress,
    scope + 1n, // Different scope for airdrop
    demoTokenAddress,
    CONFIG_IDS.basic
  );

  await airdrop.waitForDeployment();
  const airdropAddress = await airdrop.getAddress();
  console.log(`✅ CommunityAirdrop deployed to: ${airdropAddress}`);

  // Deploy Governance contract
  console.log("📦 Deploying Governance contract...");
  const Governance = await ethers.getContractFactory("UnbankedGovernance");

  const governance = await Governance.deploy(
    unbankedIdentityAddress // Only needs the identity contract address
  );

  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log(`✅ Governance deployed to: ${governanceAddress}`);

  // Deploy Lending contract
  console.log("📦 Deploying Lending contract...");
  const Lending = await ethers.getContractFactory("UnbankedLending");

  const lending = await Lending.deploy(
    demoTokenAddress,
    unbankedIdentityAddress
  );

  await lending.waitForDeployment();
  const lendingAddress = await lending.getAddress();
  console.log(`✅ Lending deployed to: ${lendingAddress}`);

  // Transfer tokens to contracts
  console.log("💸 Transferring tokens to contracts...");

  // Airdrop contract gets 100k tokens
  const airdropTransferTx = await demoToken.transfer(
    airdropAddress,
    ethers.parseEther("100000")
  );
  await airdropTransferTx.wait();
  console.log("✅ Tokens transferred to airdrop contract");

  // Lending pool gets 500k tokens
  const lendingTransferTx = await demoToken.transfer(
    lendingAddress,
    ethers.parseEther("500000")
  );
  await lendingTransferTx.wait();
  console.log("✅ Tokens transferred to lending contract");

  // Fund the lending pool (optional - skip if it fails)
  try {
    console.log("🏦 Funding lending pool...");
    const fundPoolTx = await lending.fundPool(ethers.parseEther("500000"));
    await fundPoolTx.wait();
    console.log("✅ Lending pool funded");
  } catch (error) {
    console.log("⚠️  Lending pool funding failed - continuing deployment...");
    console.log("   Pool can be funded manually later");
  }

  // Save deployment info
  const deploymentInfo = {
    network: network,
    timestamp: new Date().toISOString(),
    contracts: {
      unbankedIdentity: unbankedIdentityAddress,
      communityAirdrop: airdropAddress,
      governance: governanceAddress,
      lending: lendingAddress,
      demoToken: demoTokenAddress,
      selfHub: hubAddress,
    },
    configuration: {
      scope: scope.toString(),
      configId: CONFIG_IDS.basic,
    },
    tokenDistribution: {
      airdropPool: "100000",
      lendingPool: "500000",
      remaining: "400000",
    },
    deployer: deployer.address,
  };

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Write deployment info to file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments");

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${network}-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment complete!");
  console.log(
    `📁 Deployment info saved to: deployments/${network}-latest.json`
  );
}

// Mock contracts for local testing
const mockContracts = `
// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract MockSelfHub {
    function verify(bytes calldata) external pure returns (bool) {
        return true;
    }
}

contract DemoToken {
    mapping(address => uint256) public balanceOf;
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    constructor(string memory _name, string memory _symbol, uint256 _supply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
`;

// Create mock contracts if they don't exist
const fs = require("fs");
const path = require("path");
const mockPath = path.join(__dirname, "../contracts/mocks.sol");
if (!fs.existsSync(mockPath)) {
  fs.writeFileSync(mockPath, mockContracts);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
