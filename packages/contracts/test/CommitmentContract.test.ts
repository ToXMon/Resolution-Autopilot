import { ethers } from "hardhat";

describe("CommitmentContract", function () {
  async function deployFixture() {
    const [owner, user, charity, addr1] = await ethers.getSigners();

    const CommitmentContract = await ethers.getContractFactory("CommitmentContract");
    const contract = await CommitmentContract.deploy(charity.address);
    await contract.waitForDeployment();

    // Fund contract with bonus pool
    await owner.sendTransaction({
      to: await contract.getAddress(),
      value: ethers.parseEther("1.0"),
    });

    return { contract, owner, user, charity, addr1 };
  }

  const STAKE_AMOUNT = ethers.parseEther("0.1");
  const DURATION_DAYS = 56;
  const TOTAL_MILESTONES = 4;
  const RESOLUTION_GOAL = "Gym 4x/week for 8 weeks";

  describe("Deployment", function () {
    it("Should deploy successfully with charity address", async function () {
      const { contract, charity, owner } = await deployFixture();
      
      const charityAddr = await contract.charityAddress();
      const ownerAddr = await contract.owner();
      const bonusPercentage = await contract.bonusPercentage();

      console.log("✓ Contract deployed successfully");
      console.log("  Charity address:", charityAddr);
      console.log("  Owner address:", ownerAddr);
      console.log("  Bonus percentage:", bonusPercentage.toString());
      
      if (charityAddr !== charity.address) throw new Error("Charity address mismatch");
      if (ownerAddr !== owner.address) throw new Error("Owner address mismatch");
      if (bonusPercentage !== BigInt(10)) throw new Error("Bonus percentage should be 10");
    });
  });

  describe("Creating Commitments", function () {
    it("Should create a commitment with stake", async function () {
      const { contract, user } = await deployFixture();

      const tx = await contract.connect(user).createCommitment(
        RESOLUTION_GOAL,
        DURATION_DAYS,
        TOTAL_MILESTONES,
        { value: STAKE_AMOUNT }
      );
      await tx.wait();

      const commitment = await contract.getCommitment(user.address);
      
      console.log("✓ Commitment created successfully");
      console.log("  User:", commitment.user);
      console.log("  Stake amount:", ethers.formatEther(commitment.stakeAmount), "ETH");
      console.log("  Total milestones:", commitment.totalMilestones.toString());
      console.log("  Is active:", commitment.isActive);

      if (commitment.user !== user.address) throw new Error("User mismatch");
      if (commitment.stakeAmount !== STAKE_AMOUNT) throw new Error("Stake amount mismatch");
      if (commitment.totalMilestones !== BigInt(TOTAL_MILESTONES)) throw new Error("Milestones mismatch");
      if (!commitment.isActive) throw new Error("Commitment should be active");
    });

    it("Should fail if stake amount is zero", async function () {
      const { contract, user } = await deployFixture();

      try {
        await contract.connect(user).createCommitment(
          RESOLUTION_GOAL,
          DURATION_DAYS,
          TOTAL_MILESTONES,
          { value: 0 }
        );
        throw new Error("Should have reverted");
      } catch (error: any) {
        if (!error.message.includes("Stake amount must be greater than 0")) {
          throw error;
        }
        console.log("✓ Correctly reverted for zero stake amount");
      }
    });

    it("Should initialize milestones correctly", async function () {
      const { contract, user } = await deployFixture();

      await contract.connect(user).createCommitment(
        RESOLUTION_GOAL,
        DURATION_DAYS,
        TOTAL_MILESTONES,
        { value: STAKE_AMOUNT }
      );

      const milestones = await contract.getMilestones(user.address);
      
      console.log("✓ Milestones initialized:", milestones.length);
      
      if (milestones.length !== TOTAL_MILESTONES) {
        throw new Error("Milestone count mismatch");
      }

      for (let i = 0; i < milestones.length; i++) {
        if (milestones[i].isCompleted) {
          throw new Error(`Milestone ${i} should not be completed`);
        }
        if (milestones[i].proofHash !== "") {
          throw new Error(`Milestone ${i} should have empty proof hash`);
        }
      }
    });
  });

  describe("Completing Milestones", function () {
    it("Should complete a milestone successfully", async function () {
      const { contract, user } = await deployFixture();

      await contract.connect(user).createCommitment(
        RESOLUTION_GOAL,
        DURATION_DAYS,
        TOTAL_MILESTONES,
        { value: STAKE_AMOUNT }
      );

      const proofHash = "QmTestHash123";
      const tx = await contract.connect(user).completeMilestone(0, proofHash);
      await tx.wait();

      const milestones = await contract.getMilestones(user.address);
      const commitment = await contract.getCommitment(user.address);

      console.log("✓ Milestone completed successfully");
      console.log("  Proof hash:", milestones[0].proofHash);
      console.log("  Completed milestones:", commitment.completedMilestones.toString());

      if (!milestones[0].isCompleted) throw new Error("Milestone should be completed");
      if (milestones[0].proofHash !== proofHash) throw new Error("Proof hash mismatch");
      if (commitment.completedMilestones !== BigInt(1)) throw new Error("Completed count mismatch");
    });

    it("Should complete commitment when all milestones are done", async function () {
      const { contract, user } = await deployFixture();

      await contract.connect(user).createCommitment(
        RESOLUTION_GOAL,
        DURATION_DAYS,
        TOTAL_MILESTONES,
        { value: STAKE_AMOUNT }
      );

      const userBalanceBefore = await ethers.provider.getBalance(user.address);

      for (let i = 0; i < TOTAL_MILESTONES; i++) {
        const tx = await contract.connect(user).completeMilestone(i, `proof${i}`);
        await tx.wait();
      }

      const commitment = await contract.getCommitment(user.address);
      const userBalanceAfter = await ethers.provider.getBalance(user.address);

      console.log("✓ All milestones completed - commitment successful");
      console.log("  Is active:", commitment.isActive);
      console.log("  Is completed:", commitment.isCompleted);
      console.log("  User received payout with 10% bonus");

      if (commitment.isActive) throw new Error("Commitment should not be active");
      if (!commitment.isCompleted) throw new Error("Commitment should be completed");
      if (userBalanceAfter <= userBalanceBefore) throw new Error("User should have received payout");
    });
  });

  describe("Forfeiting Commitments", function () {
    it("Should forfeit commitment and send to charity", async function () {
      const { contract, user, charity } = await deployFixture();

      await contract.connect(user).createCommitment(
        RESOLUTION_GOAL,
        DURATION_DAYS,
        TOTAL_MILESTONES,
        { value: STAKE_AMOUNT }
      );

      const charityBalanceBefore = await ethers.provider.getBalance(charity.address);

      const tx = await contract.connect(user).forfeitCommitment();
      await tx.wait();

      const commitment = await contract.getCommitment(user.address);
      const charityBalanceAfter = await ethers.provider.getBalance(charity.address);

      console.log("✓ Commitment forfeited - sent to charity");
      console.log("  Charity received:", ethers.formatEther(charityBalanceAfter - charityBalanceBefore), "ETH");

      if (commitment.isActive) throw new Error("Commitment should not be active");
      if (commitment.isCompleted) throw new Error("Commitment should not be completed");
      if (charityBalanceAfter - charityBalanceBefore !== STAKE_AMOUNT) {
        throw new Error("Charity should receive stake amount");
      }
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update charity address", async function () {
      const { contract, owner, addr1 } = await deployFixture();

      await contract.connect(owner).setCharityAddress(addr1.address);
      const newCharity = await contract.charityAddress();

      console.log("✓ Charity address updated successfully");
      console.log("  New charity:", newCharity);

      if (newCharity !== addr1.address) throw new Error("Charity address update failed");
    });

    it("Should allow owner to update bonus percentage", async function () {
      const { contract, owner } = await deployFixture();

      await contract.connect(owner).setBonusPercentage(20);
      const newBonus = await contract.bonusPercentage();

      console.log("✓ Bonus percentage updated successfully");
      console.log("  New bonus:", newBonus.toString(), "%");

      if (newBonus !== BigInt(20)) throw new Error("Bonus percentage update failed");
    });
  });
});
