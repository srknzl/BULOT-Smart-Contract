var abi = [
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Deposit",
		"type": "event"
	}
];
var ClientReceipt = web3.eth.contract(abi);
var clientReceipt = ClientReceipt.at("0xEC9501Ed43920507f0142110995f0C131407C4c8");
var event = clientReceipt.Deposit();
// watch for changes
event.watch(function(error, result){
 // result will contain various information
 // including the arguments given to the Deposit
 // call.
 if (!error)
 console.log(result.args._id);
});
// Or pass a callback to start watching immediately
// var event = clientReceipt.Deposit(function(error, result) {
//  if (!error)
//  console.log(result);
//  console.log(result.args);
// });