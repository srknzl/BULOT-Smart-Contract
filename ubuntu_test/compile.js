// Source https://github.com/ethereum/wiki/wiki/JavaScript-API#contract-methods
const fs = require("fs");
const path = require("path");
let solc = require('solc');
const web3 = require("web3");

var Personal = require('web3-eth-personal');
var personal = new Personal(Personal.givenProvider || 'ws://localhost:8546');

const Web3Eth = require("web3-eth");
const Eth = new Web3Eth('ws://localhost:8546');

let coinbase;
const a = async () => {
    const res = await Eth.getAccounts();
    console.log(res.length);
    coinbase = res[0];
    console.log(coinbase);
    personal.unlockAccount(coinbase, "", 600)
    .then(console.log('Account unlocked!'));
};
a();

solc.loadRemoteVersion("v0.4.21+commit.dfe3193c", (err, solc) => {
    
    let source = fs.readFileSync(path.join(__dirname,"..","bulot-baho.sol"), 'utf8');
    let eip20 = fs.readFileSync(path.join(__dirname,"..","EIP20.sol"), 'utf8');
    let eip20Interface = fs.readFileSync(path.join(__dirname,"..","EIP20Interface.sol"), 'utf8');

    var input = {
        language: 'Solidity',
        sources: {
            'bulot-baho.sol': {
                content: source
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    function findImports(path) {
        if (path === 'EIP20.sol')
            return {
                contents: eip20
            };
        else if (path === 'EIP20Interface.sol')
            return {
                contents: eip20Interface
            };
        else return { error: 'File not found' };

    };
    let compiledContract = JSON.parse(solc.compile(JSON.stringify(input), findImports));
    //console.log(compiledContract);
    //console.log(compiledContract.contracts);
    let abi = compiledContract.contracts['bulot-baho.sol'].BULOTContract.abi;
    //console.log(Eth);
    let bytecode = compiledContract.contracts['bulot-baho.sol'].BULOTContract.evm.bytecode.object;
    let gasEstimate = Eth.estimateGas({ data: bytecode });
    let EIP20 = new Eth.Contract(abi,options={ data: bytecode, gas: gasEstimate, from: coinbase });
    // Deploy contract syncronous: The address will be added as soon as the contract is mined.
    // Additionally you can watch the transaction by using the "transactionHash" property
    console.log(EIP20.transactionHash) // The hash of the transaction, which created the contract
    console.log(EIP20.address) // undefined at start, but will be auto-filled later
});




