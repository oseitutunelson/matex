const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const name = "MateX";
  const symbol = "MTX";
  const initialOwner = deployer.address;

  // Get the contract factory
  const Nft = await ethers.getContractFactory("Nft");

  console.log("Deploying NFT contract...");
  const nft = await Nft.deploy(name, symbol, initialOwner);

  // Wait until it's mined
  await nft.waitForDeployment(); // This is the updated ethers.js v6 way

  console.log("NFT deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
