import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const charityAddress = process.env.CHARITY_ADDRESS || deployer.address;

  console.log("Charity address:", charityAddress);

  const CommitmentContract = await ethers.getContractFactory("CommitmentContract");
  const contract = await CommitmentContract.deploy(charityAddress);

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("CommitmentContract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
