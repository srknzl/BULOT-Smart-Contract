pragma solidity ^0.5.12;
library Set {
    struct Data { mapping(uint => bool) flags; 
        
    }
    function insert(Data storage self, uint value) public returns (bool){
        if (self.flags[value])
            return false; // already there
        self.flags[value] = true;
        return true;
    }
    function remove(Data storage self, uint value) public returns (bool){
        if (!self.flags[value])
            return false; // not there
        self.flags[value] = false;
        return true;
    }
    function contains(Data storage self, uint value) public view returns (bool){
        return self.flags[value];
    }
}
contract C {
    using Set for Set.Data; // this is the crucial change Set.Data knownValues;
    Set.Data knownValues;
    function register(uint value) public returns (bool) {
        // Here, all variables of type Set.Data have
        // corresponding member functions.
        // The following function call is identical to
        // Set.insert(knownValues, value)
        require (knownValues.insert(value));
        return true;
    }
    function remove(uint value) public {
        // Here, all variables of type Set.Data have
        // corresponding member functions.
        // The following function call is identical to
        // Set.insert(knownValues, value)
        require (knownValues.remove(value)) ;
    }
    function contains(uint value) public view returns(bool){
        return knownValues.contains(value);
    }
}