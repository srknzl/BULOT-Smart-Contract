personal.unlockAccount(eth.accounts[0], '');
var accountNumber = eth.accounts.length;
if (accountNumber < 1000) {
    console.log("Creating " + 1000 - accountNumber + " more accounts to make total accounts 1000");
    for (var i = 0; i < 1000 - accountNumber; i++)personal.newAccount("pass");
}
console.log("Number of accounts:", eth.accounts.length);
console.log("Making every accounts balance 10 ethers...");

for (var i = 1; i < 1000; i++) {
    var balance = eth.getBalance(eth.accounts[i]);
    if (balance < new BigNumber(1e9)) { // If account has less than 10 ethers send 10 ethers for gas costs 
        var tx = { from: eth.accounts[0], to: eth.accounts[i], value: new BigNumber(1e19).minus(balance) };
        personal.sendTransaction(tx, "");
    }
}
var BULOTContract = web3.eth.contract(bulotAbi);
var EIP20Contract = web3.eth.contract(eip20Abi);

var BULOTContractInstance = BULOTContract.new();
