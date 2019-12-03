loadScript('EIP20.js');
loadScript('BULOTContract.js');

var eip20address = "0x2264978B2AC6EA41D032F0b806b268a0cc5c15ed";
var eip20network = web3.eth.contract(eip20abi).at(eip20address);

var bulotAddress = "0xf6c74e5afFf933343a080FED1dF18226274982F1";
var bulotNetwork = web3.eth.contract(bulotContract).at(bulotAddress);

console.log("Number of accounts:", eth.accounts.length);

personal.unlockAccount(eth.accounts[0], '');

var accountNumber = eth.accounts.length;
if (accountNumber < 1000) {
    console.log("Creating " + 10 - accountNumber + " more accounts to make total accounts 1000");
    for (var i = 0; i < 10 - accountNumber; i++) {
        personal.newAccount("pass");
    }
}

console.log("Making every accounts balance 10 ethers...");

eth.accounts.forEach(function (account, index) {
    if (index > 0) {
        var balance = eth.getBalance(account);
        if (balance < new BigNumber(1e9)) { // If account has less than 10 ethers send 10 ethers for gas costs 
            var tx = { from: eth.accounts[0], to: account, value: new BigNumber(1e19).minus(balance) };
            personal.sendTransaction(tx, "");
        }
    }
});

var blockCreationInterval = setInterval(function () {
    personal.unlockAccount(eth.accounts[0], '');
    var tx = { from: eth.accounts[0], to: eth.accounts[1], value: new BigNumber(1e18) };
    personal.sendTransaction(tx, "");

    personal.unlockAccount(eth.accounts[1], 'pass');
    var tx = { from: eth.accounts[1], to: eth.accounts[0], value: new BigNumber(1e18) };
    personal.sendTransaction(tx, "pass");

}, 500);



// Random numbers that will be used to reveal
var randomNumbers = new Array();
var revealed = false;


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

eth.accounts.forEach(function (account, index) {
    if(index > 0){
        personal.unlockAccount(eth.accounts[0], '');
        eip20network.transfer(account, 10, {
            from: eth.accounts[0]
        });
        personal.unlockAccount(account, 'pass');
        eip20network.approve(bulotAddress, 10, {
            from: account
        });
        var randomNum = Math.floor(Math.random() * 1000000);
        randomNumbers.push(randomNum);
        var hashed = bulotNetwork.hashRandomNumber(randomNum, {
            from: account
        });
        bulotNetwork.purchaseTicket(hashed, {
            from: account
        });
    }
});


var revealInterval = setInterval(function () {
    console.log("Revealing trial");
    var isSubmission = bulotNetwork.isSubmissionStage();
    if (!isSubmission && !revealed) {
        console.log("Submission ended, revealing")


        personal.unlockAccount(eth.accounts[0], '');
        bulotNetwork.revealNumber(randomNumbers[0], {
            from: eth.accounts[0]
        });

        eth.accounts.forEach(function (account, index) {
            if (index > 0) {
                personal.unlockAccount(account, 'pass');
                bulotNetwork.revealNumber(randomNumbers[index], {
                    from: account
                });
            }
        });
        revealed = true;
    } else {
        console.log("Submission not ended. Will try to start revealing again in 100 seconds.")
    }


}, 30 * 1000);

var withdrawInterval = setInterval(function () {
    console.log("Withdraw trial");
    var isSubmission = bulotNetwork.isSubmissionStage();
    var currentLotteryNo = bulotNetwork.getCurrentLotteryNo();

    if (isSubmission && currentLotteryNo == 2) {

        personal.unlockAccount(eth.accounts[0], '');
        for (var i = 0; i < 15; i++) { // Log2 10000 = 14
            var prize = bulotNetwork.checkPrizeWon(1, i, eth.accounts[0], {
                from: eth.accounts[0]
            });
            if (prize > 0) {
                bulotNetwork.withdraw(1, i, {
                    from: eth.accounts[0]
                });
            }
        }

        eth.accounts.forEach(function (account, index) {
            if (index > 0) {
                personal.unlockAccount(account, 'pass');
                for (var j = 0; j < 15; j++) { // Log2 10000 = 14
                    var prize = bulotNetwork.checkPrizeWon(1, j, account, {
                        from: account
                    });
                    if (prize > 0) {
                        bulotNetwork.withdraw(1, j, {
                            from: account
                        });
                    }
                }
            }
        });
        clearInterval(revealInterval);
        clearInterval(withdrawInterval);
        console.log("Simulation ends..");
    } else {
        console.log("Lottery not ended. Will try to start withdrawing again in 100 seconds.")
    }

}, 30 * 1000);