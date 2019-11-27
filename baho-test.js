loadScript('EIP20.js');
loadScript('BULOTContract.js');

var eip20address = "0x77Ab6ef8A3b37613941d41663Fa070773Ea273C0";
var eip20network = web3.eth.contract(eip20abi).at(eip20address);

var bulotAddress = "0x842afFC814e5FF3492cB50f8C9c3cD874471c2B8";
var bulotNetwork = web3.eth.contract(bulotContract).at(bulotAddress);

var purchaseTicketEvent = bulotNetwork.PurchaseTicket();
purchaseTicketEvent.watch(function (error, result) {
    if (!error)
        console.log("A person with address ", result.args.sender, " has purchased a ticket with ", result.args.randomHashed, " random hash.");
    else console.log(error);
});

var revealNumberEvent = bulotNetwork.RevealNumber();
revealNumberEvent.watch(function (error, result) {
    if (!error)
        console.log("A person with address ", result.args.sender, " has revealed his/her number: ", result.args.randomNum, ".");
    else console.log(error);
});

var prizeWithdrawnEvent = bulotNetwork.PrizeWithdrawn();
purchaseTicketEvent.watch(function (error, result) {
    if (!error)
        console.log(result.args._index, "st/nd/th winner with address ", result.arg._player, " withdraws his/her prize during lottery ", result.args._lotteryNo, ".")
    else console.log(error);
});

var accountNumber = eth.accounts.length;
if (accountNumber < 1000) {
    console.log("Creating " + 10 - accountNumber + " more accounts to make total accounts 1000");
    for (var i = 0; i < 10 - accountNumber; i++) {
        personal.newAccount("pass");
    }
}
console.log("Number of accounts:", eth.accounts.length);
console.log("Making every accounts balance 10 ethers...");
personal.unlockAccount(eth.accounts[0], '');

// for (var i = 1; i < 1000; i++) {
//     var balance = eth.getBalance(eth.accounts[i]);
//     if (balance < new BigNumber(1e9)) { // If account has less than 10 ethers send 10 ethers for gas costs 
//         var tx = { from: eth.accounts[0], to: eth.accounts[i], value: new BigNumber(1e19).minus(balance) };
//         personal.sendTransaction(tx, "");
//     }
// }

// Random numbers that will be used to reveal
var randomNumbers = new Array();

// Main account buys a ticket
personal.unlockAccount(eth.accounts[0], '');
eip20network.approve(bulotAddress, 10, {
    from: eth.accounts[0]
});
var randomNum = Math.floor(Math.random() * 1000000);
randomNumbers.push(randomNum);
var hashed = bulotNetwork.hashRandomNumber(randomNum, {
    from: eth.accounts[0]
});
bulotNetwork.purchaseTicket(hashed, {
    from: eth.accounts[0]
});

for (var i = 1; i < 1000; i++) { // Everyone buys a ticket 
    personal.unlockAccount(eth.accounts[0], '');
    eip20network.transfer(eth.accounts[i], 10, {
        from: eth.accounts[0]
    });
    personal.unlockAccount(eth.accounts[i], 'pass');
    eip20network.approve(bulotAddress, 10, {
        from: eth.accounts[i]
    });
    var randomNum = Math.floor(Math.random() * 1000000);
    randomNumbers.push(randomNum);
    var hashed = bulotNetwork.hashRandomNumber(randomNum, {
        from: eth.accounts[i]
    });
    bulotNetwork.purchaseTicket(hashed, {
        from: eth.accounts[i]
    });
}


setTimeout(function () {
    console.log("Revealing after 300 seconds..");

    personal.unlockAccount(eth.accounts[0], '');
    var success = bulotNetwork.revealNumber(randomNumbers[0], {
        from: eth.accounts[0]
    });
    console.log("Reveal account 0: ", success);

    for (var i = 1; i < 1000; i++) { // Everyone buys a ticket 
        personal.unlockAccount(eth.accounts[i], 'pass');
        var success = bulotNetwork.revealNumber(randomNumbers[i], {
            from: eth.accounts[i]
        });
        console.log("Reveal account ",i," :", success);
    }
}, 300 * 1000);