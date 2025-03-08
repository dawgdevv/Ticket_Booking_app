const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the network name
  const networkName = hre.network.name;
  console.log(`Deploying to ${networkName}...`);

  // Get deployer information
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Get and check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

  if (balance < hre.ethers.parseEther("0.01")) {
    console.warn("WARNING: Low balance - deployment may fail.");
    console.warn(`Make sure you have enough ${networkName} ETH for gas fees.`);
  }

  // Get contract factory
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");

  // Deploy the contract
  console.log("Deploying TicketNFT...");
  const ticketNFT = await TicketNFT.deploy();
  await ticketNFT.waitForDeployment();

  // Get contract address
  const ticketNFTAddress = await ticketNFT.getAddress();
  console.log(`TicketNFT deployed to: ${ticketNFTAddress}`);

  // Get chain ID and convert BigInt to string
  const network = await deployer.provider.getNetwork();
  const chainId = network.chainId.toString();

  // Save deployment details to a file
  const deploymentInfo = {
    network: networkName,
    contractAddress: ticketNFTAddress,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    chainId: chainId, // Convert BigInt to string
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${networkName}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment information saved to deployments directory");
  console.log("Waiting for block confirmations...");

  // Wait for block confirmations (more on testnets)
  if (networkName !== "hardhat" && networkName !== "localhost") {
    await new Promise((r) => setTimeout(r, 30000)); // 30 seconds wait
    const receipt = await deployer.provider.getTransactionReceipt(
      ticketNFT.deploymentTransaction().hash
    );
    console.log(
      `Contract deployed with ${
        receipt ? receipt.confirmations : "pending"
      } confirmations`
    );
  }

  console.log("Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log(
    `1. Update your backend .env with TICKET_NFT_CONTRACT_ADDRESS=${ticketNFTAddress}`
  );
  console.log(
    `2. Update your frontend contract configuration with this address`
  );

  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log(`3. Verify contract on ${networkName} blockchain explorer:`);
    console.log(
      `   npx hardhat verify --network ${networkName} ${ticketNFTAddress}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
