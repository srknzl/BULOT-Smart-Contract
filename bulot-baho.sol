pragma solidity ^0.4.22;

import "./EIP20.sol";

contract BULOT {
    struct Ticket {
        bytes32 hash;
        uint purchasedAt;
    }
    
    struct Game {
        uint256 totalPrize;
        address[] revealedPlayers;
        mapping(uint=>bool) withdrawnPrizes; 
        uint randomNumber;
        mapping(address=>Ticket) players;
    }
    
    uint constant STAGEDURATION = 60; // TODO: check the duration
    mapping(uint=>Game) public games;
    uint start;
    
    EIP20 network;
    
    event PurchaseTicket(address sender, bytes32 randomHashed);
    event RevealNumber(address sender, uint randomNum);
    event PrizeWithdrawn(address _player, uint _lotteryNo, uint _index);
    
    function () public {    // prevents random payments in fallback function
        revert();
    }

    constructor(address _network) public {
        network = EIP20(_network);
        start = now;
    }
    
    function getCurrentLotteryNo() public view returns (uint) {
        return (now - start) / (2 * STAGEDURATION) + 1;
    }

    function isSubmissionStage() public view returns (bool) {
        return (now - start) % (2 * STAGEDURATION) < STAGEDURATION;
    }

    modifier submission() {
        require(isSubmissionStage(), 'Not in submission stage');
        _;
    }
    
    modifier reveal() {
        require(!isSubmissionStage(), 'Not in reveal stage');
        _;
    }
    
    function purchaseTicket(bytes32 randomHashed) public submission returns(bool success) {
        uint lotteryNo = getCurrentLotteryNo();
        // prevents purchasing more than one ticket per lottery
        require(
            games[lotteryNo].players[msg.sender].hash == 0,
            'Already bought a ticket in the current lottery');
        require(
            network.transferFrom(msg.sender, address(this), 10),
            'The payment failed. Please allow the transfer of 10 TL to the address of that contract');
        games[lotteryNo].players[msg.sender].hash = randomHashed;
        games[lotteryNo].players[msg.sender].purchasedAt = lotteryNo;
        games[lotteryNo].totalPrize += 10;
        emit PurchaseTicket(msg.sender, randomHashed);
        return true;
    }
    
    function revealNumber(uint randomNum) public reveal returns(bool success) {
        bytes32 hashed = keccak256(randomNum, msg.sender);
        uint lotteryNo = getCurrentLotteryNo();
        // verifies the sender bought a ticket in the current lottery
        require(
            games[lotteryNo].players[msg.sender].purchasedAt == lotteryNo,
            "Haven't bought a ticket in the current lottery or already revealed your random number");
        require(
        // verifies the sender is revealing the number he committed in the submission stage
        games[lotteryNo].players[msg.sender].hash == hashed,
        'Failed submitted random number revelation attempt');
        
        games[lotteryNo].revealedPlayers.push(msg.sender);
        games[lotteryNo].randomNumber ^= randomNum;
        delete games[lotteryNo].players[msg.sender].purchasedAt;
        emit RevealNumber(msg.sender, randomNum);
        return true;
    }
    
    function hashRandomNumber(uint randomNum) public view returns (bytes32 hashed) {
        return keccak256(randomNum, msg.sender);
    }

    // source: https://ethereum.stackexchange.com/questions/8086/logarithm-math-operation-in-solidity/32900#32900
    // ceils the result of log_2(x)
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
    
    function checkPrizeWon(uint _lotteryNo, uint _index, address _player) public view returns (uint prize) {
        uint lotteryNo = getCurrentLotteryNo();
        
        // cannot ask if the sender has won any prize in the future
        require(_lotteryNo < lotteryNo, "The lottery with given number hasn't finished yet");        
        
        Game storage gameAsked = games[_lotteryNo]; 
        uint M = gameAsked.totalPrize;  // total amount of money collected in the game with given number
        
        uint indexRange = logarithm2(M);        // log2(M)
        require(_index < indexRange, "no winner in that position and beyond");

        uint P;
        bytes32 hash = keccak256(gameAsked.randomNumber);
        for(uint i=0; i <= _index; i++) {
            // calculate P_i
            P = M % 2;
            M = M >> 1;         // integer division by 2
            P += M;
            hash = keccak256(hash);
        }
        
        address winner = gameAsked.revealedPlayers[uint(hash) % gameAsked.revealedPlayers.length];
        if(winner == _player) {
            return P;
        }
        else {
            return 0;
        }
    }
    
    function withdraw(uint _lotteryNo, uint _index) public {
        uint prize = checkPrizeWon(_lotteryNo, _index, msg.sender);
        require(prize > 0, 'Won no prize, sorry.');     // revert if sender won nothing yet
        
        // verifies the player hasn't withdrawn his prize
        require(games[_lotteryNo].withdrawnPrizes[_index] == false, "Already withdrawn the prize");
        
        require(            // transfers winner's tokens
            network.transfer(msg.sender, prize),
            "Failed to transfer your prize to your address, somehow.");
        
        games[_lotteryNo].withdrawnPrizes[_index] = true;    // marks the prize as paid
        emit PrizeWithdrawn(msg.sender, _lotteryNo, _index);
    }
}