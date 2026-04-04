import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();


  const charityAddress = process.env.CHARITY_ADDRESS || deployer.address;


  const CommitmentContract = await ethers.getContractFactory("CommitmentContract");
  const contract = await CommitmentContract.deploy(charityAddress);

  await contract.waitForDeployment();

  const address = await contract.getAddress();

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
