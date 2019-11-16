pragma solidity >=0.4.21;

import "./EIP20.sol";
/*
0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c
0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C
0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB

Bulot contract:
0x375EaE23b65fEB1833072328647902f1FE9afA61
//*/

contract BULOTContract {

    bool isSubmission;
    uint public nextStageTimestamp;
    mapping(address=>bytes32) players;
    mapping(address=>bool) cheaters;
    uint numPlayers;
    uint numCheaters;
    address[] revealedPlayers;
    uint numRevealedPlayers;
    
    EIP20 network;
    
    function BULOTContract(address _network) public {
        network = EIP20(_network);
        isSubmission = true;
        nextStageTimestamp = now + 604800;  // adds 1 week to the current date
        numPlayers = 0;
        numCheaters = 0;
    }
    
    function () public {    // prevent random payments in fallback function
        revert();
    }

    function purchaseTicket(bytes32 randomHashed) public returns(bool) {
        require(network.transferFrom(msg.sender, address(this), 10));
        players[msg.sender] = randomHashed;
        numPlayers++;
        return true;
    }
    
    function hashRandomNumber(uint randomNum) public view returns (uint256 hashed) {
        return uint256(keccak256(randomNum, msg.sender));
    }
}