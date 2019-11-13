pragma solidity >=0.5.0;

contract BULOTContract {
    enum Stages { Submission, Reveal }
    
    address owner;
    Stages lotteryStage; 
    
    function () external payable{ 
        revert();
    }
   
    constructor() public{
        owner = msg.sender;
        lotteryStage = Stages.Submission;
    }
    
    function random() public view returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp,block.difficulty)))%251);
    }

}