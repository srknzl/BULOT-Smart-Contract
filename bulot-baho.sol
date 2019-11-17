pragma solidity >=0.4.21;
// TODO: check comments. and their consistency
import "./EIP20.sol";
/*
0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c
0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C
0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB

Bulot contract:
0x375EaE23b65fEB1833072328647902f1FE9afA61
//*/

contract BULOTContract {
    uint constant STAGEDURATION = 604800;
    bool isSubmission;
    uint public nextStageTimestamp;
    mapping(address=>bytes32) players;
    mapping(address=>bool) cheaters;
    uint numPlayers;
    uint numCheaters;
    address[] revealedPlayers;
    uint numRevealedPlayers;    // TODO: redundant? revealedPlayers.length?
    mapping(address => uint) winners;
    
    EIP20 network;
    
    function BULOTContract(address _network) public {
        network = EIP20(_network);
        // TODO: make it not create when _network isn't given
        isSubmission = true;
        nextStageTimestamp = now + STAGEDURATION;   // adds 1 week to the current date
        numPlayers = 0;
        numCheaters = 0;
    }
    
    function () public {    // prevent random payments in fallback function
        revert();
    }
    
    modifier stageUpToDate() {
        while(now >= nextStageTimestamp) {
            if(isSubmission) {
                // TODO: when submission is finished
                isSubmission = false;
                nextStageTimestamp += STAGEDURATION;
            } else {
                // TODO: when reveal is finished
                findWinners();
                // TODO: delete players; not allowed
                numPlayers = 0;
                delete revealedPlayers;
                delete numRevealedPlayers;
            }
            isSubmission = !isSubmission;
            nextStageTimestamp += STAGEDURATION;
        }
        _;
    }
    
    modifier submission() {
        require(isSubmission);
        _;
    }
    
    modifier reveal() {
        require(!isSubmission);
        require(players[msg.sender] > 0);   // TODO: needed?
        _;
    }

    function purchaseTicket(bytes32 randomHashed) public stageUpToDate submission returns(bool) {
        require(network.transferFrom(msg.sender, address(this), 10));
        players[msg.sender] = randomHashed;
        numPlayers++;
        return true;
    }
    
    function revealNumber(uint randomNum) public stageUpToDate reveal returns(bool success) {
        bytes32 hashed = keccak256(randomNum, msg.sender);
        if(players[msg.sender] == hashed) {
            // TODO: when the player didn't lie
            revealedPlayers.push(msg.sender);
            numRevealedPlayers++;
            delete players[msg.sender];
            return true;
        } else {
            // TODO when the player lied
            return false;
        }
    }
    
    function changeStage() public {
        // TODO: remove it
        isSubmission = !isSubmission;
    }
    
    function test(uint rand) public view returns (uint) {
        return rand + uint(msg.sender);
    }
    
    function hashRandomNumber(uint randomNum) public view returns (bytes32 hashed) {
        return keccak256(randomNum, msg.sender);
    }
    
    function integerDivision(uint dividend, uint divisor) public pure returns (uint quotient) {
        return (dividend - dividend % divisor) / divisor;
    }
    
    function logarithm2(uint x) public pure returns (uint y){
        assembly {
            let arg := x
            x := sub(x,1)
            x := or(x, div(x, 0x02))
            x := or(x, div(x, 0x04))
            x := or(x, div(x, 0x10))
            x := or(x, div(x, 0x100))
            x := or(x, div(x, 0x10000))
            x := or(x, div(x, 0x100000000))
            x := or(x, div(x, 0x10000000000000000))
            x := or(x, div(x, 0x100000000000000000000000000000000))
            x := add(x, 1)
            let m := mload(0x40)
            mstore(m,           0xf8f9cbfae6cc78fbefe7cdc3a1793dfcf4f0e8bbd8cec470b6a28a7a5a3e1efd)
            mstore(add(m,0x20), 0xf5ecf1b3e9debc68e1d9cfabc5997135bfb7a7a3938b7b606b5b4b3f2f1f0ffe)
            mstore(add(m,0x40), 0xf6e4ed9ff2d6b458eadcdf97bd91692de2d4da8fd2d0ac50c6ae9a8272523616)
            mstore(add(m,0x60), 0xc8c0b887b0a8a4489c948c7f847c6125746c645c544c444038302820181008ff)
            mstore(add(m,0x80), 0xf7cae577eec2a03cf3bad76fb589591debb2dd67e0aa9834bea6925f6a4a2e0e)
            mstore(add(m,0xa0), 0xe39ed557db96902cd38ed14fad815115c786af479b7e83247363534337271707)
            mstore(add(m,0xc0), 0xc976c13bb96e881cb166a933a55e490d9d56952b8d4e801485467d2362422606)
            mstore(add(m,0xe0), 0x753a6d1b65325d0c552a4d1345224105391a310b29122104190a110309020100)
            mstore(0x40, add(m, 0x100))
            let magic := 0x818283848586878898a8b8c8d8e8f929395969799a9b9d9e9faaeb6bedeeff
            let shift := 0x100000000000000000000000000000000000000000000000000000000000000
            let a := div(mul(x, magic), shift)
            y := div(mload(add(m,sub(255,a))), shift)
            y := add(y, mul(256, gt(arg, 0x8000000000000000000000000000000000000000000000000000000000000000)))
        }
    }
    
    function findWinners() private {
        uint M = revealedPlayers.length * 10;   // total amount of money collected
        uint indexRange = logarithm2(M);        // log2(M)
        
        uint P;
        for(uint i=1; i <= indexRange; i++) {
            // calculate P_i 
            M = integerDivision(M, 2);
            P = M;
            M = integerDivision(M, 2);
            P += M % 2;
            // TODO: assign the prize to the winner
        }
    }
    
    function withdraw() public returns (bool success) {
        if(winners[msg.sender] > 0) {
            require(network.transfer(msg.sender, winners[msg.sender])); // transfers winner's tokens
            delete winners[msg.sender]; // deletes the winner's record,
            return true;                // returns true as success
        } else {
            return false;               // the sender won no price, no withdrawal happened
        }
    }
}