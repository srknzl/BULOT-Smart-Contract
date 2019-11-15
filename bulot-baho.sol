pragma solidity >=0.4.21;

import "./EIP20Interface.sol";
import "./EIP20.sol";

contract BULOTContract {
    enum Stages { submission, reveal }
    
    Stages current;
    uint nextStageTimestamp;
    mapping(address=>uint256) players;
    mapping(address=>bool) cheaters;
    uint numPlayers;
    uint numCheaters;
    
    EIP20Interface tokenNetwork;
    
    function BULOTContract() public {
        current = Stages.submission;
        nextStageTimestamp = now + 604800;  // adds 1 week
        tokenNetwork = EIP20Interface(this);
        numPlayers = 0;
        cheaters = 0;
    }
    
    function () public {    // prevent random payments
        revert();
    }
     
    modifier donePayment(uint _amount) {
        require(1==1);  // TODO: do something making sense
        _;
    }
    
    function purchaseTicket(bytes32 _random) public donePayment(10) {
    }
}
