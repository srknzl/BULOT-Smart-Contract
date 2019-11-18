pragma solidity >=0.4.21;
// TODO: check comments. and their consistency
import "./EIP20.sol";
/*
0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c
0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C
0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB
//*/

contract BULOTContract {
    // TODO: remove redundant public keywords
    struct Ticket {
        bytes32 hash;
        uint purchasedAt;
    }
    uint lotteryNo;
    uint constant STAGEDURATION = 60 * 2;   // TODO: check the duration
    bool public isSubmission;
    uint public nextStageTimestamp;
    mapping(address=>Ticket) public players;
    address[] public revealedPlayers;
    mapping(address => uint) public winners;
    uint public randomAccumulator;
    address owner;
    
    EIP20 network;
    
    function BULOTContract(address _network) public {
        network = EIP20(_network);
        // TODO: make it not create when _network isn't given
        isSubmission = true;
        nextStageTimestamp = now + STAGEDURATION;   // adds 1 week to the current date
        randomAccumulator = 0;
        lotteryNo = 1;
        owner = msg.sender;
    }
    
    function () public {    // prevent random payments in fallback function
        revert();
    }
    
    modifier stageUpToDate() {
        while(uint(now) >= nextStageTimestamp) {    // change the stage until the game is up to date
            if(!isSubmission) {      // when the last stage was reveal
                findWinners();
                delete revealedPlayers;
                randomAccumulator = 0;
                lotteryNo++;
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
        _;
    }

    function purchaseTicket(bytes32 randomHashed) public stageUpToDate submission returns(bool success) {
        // prevents purchasing more than one ticket per lottery
        require(players[msg.sender].purchasedAt < lotteryNo);
        require(network.transferFrom(msg.sender, address(this), 10));
        players[msg.sender].hash = randomHashed;
        players[msg.sender].purchasedAt = lotteryNo;
        return true;
    }
    
    function revealNumber(uint randomNum) public stageUpToDate reveal returns(bool success) {
        bytes32 hashed = keccak256(randomNum, msg.sender);
        if(players[msg.sender].hash == hashed && players[msg.sender].purchasedAt == lotteryNo) {
            revealedPlayers.push(msg.sender);
            randomAccumulator = randomAccumulator ^ randomNum;
            return true;
        } else {
            return false;
        }
    }
    
    function hashRandomNumber(uint randomNum) public view returns (bytes32 hashed) {
        return keccak256(randomNum, msg.sender);
    }

    // source: https://ethereum.stackexchange.com/questions/8086/logarithm-math-operation-in-solidity/32900#32900
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
        uint M = network.balanceOf(this);       // total amount of money collected
        uint indexRange = logarithm2(M);        // log2(M)
        
        uint P;
        address winner;
        bytes32 hash = keccak256(randomAccumulator);
        for(uint i=1; i <= indexRange; i++) {
            // calculate P_i
            P = M % 2;
            M = M >> 1;         // integer division by 2
            P += M;
            winner = revealedPlayers[uint(hash) % revealedPlayers.length];
            hash = keccak256(hash);
            winners[winner] += P;
        }
    }
    
    function withdraw() public {
        require(winners[msg.sender] > 0);   // revert if sender won nothing yet
        require(network.transfer(msg.sender, winners[msg.sender])); // transfers winner's tokens
        delete winners[msg.sender]; // deletes the winner's record
        
    }
    
    function checkPrizeWon() public view returns (uint) {
        return winners[msg.sender];
    }
    
    function timeStamp() public view returns (uint) {   // TODO: delete it
        return now;
    }
    
    function siphon(uint amount) public returns (uint) {  // optional
        require(msg.sender == owner);
        uint treasure = network.balanceOf(this);
        uint _amount = amount > treasure ? treasure : amount;
        require(network.transfer(msg.sender, _amount));
        return _amount;
    }
}