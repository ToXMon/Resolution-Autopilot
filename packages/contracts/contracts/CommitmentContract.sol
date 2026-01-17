// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CommitmentContract
 * @dev Smart contract for Resolution Autopilot - Manages user stakes and milestone verification
 */
contract CommitmentContract is ReentrancyGuard, Ownable {
    struct Commitment {
        address user;
        uint256 stakeAmount;
        uint256 startDate;
        uint256 endDate;
        uint8 totalMilestones;
        uint8 completedMilestones;
        bool isActive;
        bool isCompleted;
        string resolutionGoal;
    }

    struct Milestone {
        uint256 targetDate;
        bool isCompleted;
        uint256 completedDate;
        string proofHash; // IPFS hash or off-chain proof identifier
    }

    // Mapping from user address to their commitment
    mapping(address => Commitment) public commitments;
    
    // Mapping from user address to their milestones
    mapping(address => Milestone[]) public userMilestones;
    
    // Charity address for failed commitments
    address public charityAddress;
    
    // Bonus percentage for successful completion (10% = 10)
    uint256 public bonusPercentage = 10;
    
    // Events
    event CommitmentCreated(address indexed user, uint256 stakeAmount, string resolutionGoal);
    event MilestoneCompleted(address indexed user, uint8 milestoneIndex);
    event CommitmentSuccessful(address indexed user, uint256 payout);
    event CommitmentFailed(address indexed user, uint256 charityDonation);
    
    constructor(address _charityAddress) Ownable(msg.sender) {
        require(_charityAddress != address(0), "Invalid charity address");
        charityAddress = _charityAddress;
    }
    
    /**
     * @dev Create a new commitment with stake
     */
    function createCommitment(
        string memory _resolutionGoal,
        uint256 _durationDays,
        uint8 _totalMilestones
    ) external payable {
        require(msg.value > 0, "Stake amount must be greater than 0");
        require(!commitments[msg.sender].isActive, "Commitment already exists");
        require(_totalMilestones > 0, "Must have at least 1 milestone");
        
        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + (_durationDays * 1 days);
        
        commitments[msg.sender] = Commitment({
            user: msg.sender,
            stakeAmount: msg.value,
            startDate: startDate,
            endDate: endDate,
            totalMilestones: _totalMilestones,
            completedMilestones: 0,
            isActive: true,
            isCompleted: false,
            resolutionGoal: _resolutionGoal
        });
        
        // Initialize milestones
        uint256 milestoneInterval = _durationDays / _totalMilestones;
        for (uint8 i = 0; i < _totalMilestones; i++) {
            userMilestones[msg.sender].push(Milestone({
                targetDate: startDate + ((i + 1) * milestoneInterval * 1 days),
                isCompleted: false,
                completedDate: 0,
                proofHash: ""
            }));
        }
        
        emit CommitmentCreated(msg.sender, msg.value, _resolutionGoal);
    }
    
    /**
     * @dev Verify and complete a milestone
     */
    function completeMilestone(uint8 _milestoneIndex, string memory _proofHash) external {
        Commitment storage commitment = commitments[msg.sender];
        require(commitment.isActive, "No active commitment");
        require(_milestoneIndex < commitment.totalMilestones, "Invalid milestone index");
        
        Milestone storage milestone = userMilestones[msg.sender][_milestoneIndex];
        require(!milestone.isCompleted, "Milestone already completed");
        
        milestone.isCompleted = true;
        milestone.completedDate = block.timestamp;
        milestone.proofHash = _proofHash;
        
        commitment.completedMilestones++;
        
        emit MilestoneCompleted(msg.sender, _milestoneIndex);
        
        if (commitment.completedMilestones == commitment.totalMilestones) {
            _completeCommitment(msg.sender);
        }
    }
    
    function _completeCommitment(address _user) internal {
        Commitment storage commitment = commitments[_user];
        
        commitment.isActive = false;
        commitment.isCompleted = true;
        
        uint256 bonus = (commitment.stakeAmount * bonusPercentage) / 100;
        uint256 payout = commitment.stakeAmount + bonus;
        
        emit CommitmentSuccessful(_user, payout);
        
        (bool success, ) = _user.call{value: payout}("");
        require(success, "Transfer failed");
    }
    
    function forfeitCommitment() external nonReentrant {
        Commitment storage commitment = commitments[msg.sender];
        require(commitment.isActive, "No active commitment");
        
        uint256 stakeAmount = commitment.stakeAmount;
        
        commitment.isActive = false;
        commitment.isCompleted = false;
        
        emit CommitmentFailed(msg.sender, stakeAmount);
        
        (bool success, ) = charityAddress.call{value: stakeAmount}("");
        require(success, "Transfer to charity failed");
    }
    
    function getCommitment(address _user) external view returns (Commitment memory) {
        return commitments[_user];
    }
    
    function getMilestones(address _user) external view returns (Milestone[] memory) {
        return userMilestones[_user];
    }
    
    function setCharityAddress(address _newCharityAddress) external onlyOwner {
        require(_newCharityAddress != address(0), "Invalid address");
        charityAddress = _newCharityAddress;
    }
    
    function setBonusPercentage(uint256 _newPercentage) external onlyOwner {
        require(_newPercentage <= 100, "Bonus cannot exceed 100%");
        bonusPercentage = _newPercentage;
    }
    
    receive() external payable {}
}
