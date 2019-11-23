loadScript('EIP20.abi');
loadScript('BULOTContract.abi');

var eip20address = "";
var eip20network = web3.eth.contract(eip20abi).at(eip20address);

var bulotAddress = "";
var bulotNetwork = web3.eth.contract(bulotContract).at(bulotAddress);
