var bulotContract = [
	{
		"constant": true,
		"inputs": [
			{
				"name": "_lotteryNo",
				"type": "uint256"
			},
			{
				"name": "_index",
				"type": "uint256"
			},
			{
				"name": "_player",
				"type": "address"
			}
		],
		"name": "checkPrizeWon",
		"outputs": [
			{
				"name": "prize",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "games",
		"outputs": [
			{
				"name": "totalPrize",
				"type": "uint256"
			},
			{
				"name": "randomNumber",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "randomHashed",
				"type": "bytes32"
			}
		],
		"name": "purchaseTicket",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_lotteryNo",
				"type": "uint256"
			},
			{
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getCurrentLotteryNo",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "x",
				"type": "uint256"
			}
		],
		"name": "logarithm2",
		"outputs": [
			{
				"name": "y",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "randomNum",
				"type": "uint256"
			}
		],
		"name": "hashRandomNumber",
		"outputs": [
			{
				"name": "hashed",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "isSubmissionStage",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "randomNum",
				"type": "uint256"
			}
		],
		"name": "revealNumber",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_network",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "randomHashed",
				"type": "bytes32"
			}
		],
		"name": "PurchaseTicket",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "randomNum",
				"type": "uint256"
			}
		],
		"name": "RevealNumber",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_player",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_lotteryNo",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "PrizeWithdrawn",
		"type": "event"
	}
];