loadScript('EIP20.js');
loadScript('BULOTContract.js');

var eip20address = "0x731a10897d267e19B34503aD902d0A29173Ba4B1";
var eip20network = web3.eth.contract(eip20abi).at(eip20address);

var bulotAddress = "0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84";
var bulotNetwork = web3.eth.contract(bulotContract).at(bulotAddress);

var ACCOUNTCOUNT = 100; // Number of accounts in the simulation
var coinBaseIndex = 0; // Sometimes index of the coinbase account becomes different
// after creation of accounts, it will be found if it is different
/*

Example 10 people simulation
    Account 4 -> 50 
    Account 8 -> 25 
    Account 4 -> 13 
    Account 7 ->  6
    Account 6 ->  3
    Account 7 ->  2
    Account 3 -> 1
    Total 100
*/
console.log("Number of accounts:", eth.accounts.length);

personal.unlockAccount(eth.accounts[0], '');

var accountNumber = eth.accounts.length;
if (accountNumber < ACCOUNTCOUNT) {
    console.log("Creating " + (ACCOUNTCOUNT - accountNumber) + " more accounts to make total accounts ", ACCOUNTCOUNT);
    for (var i = 0; i < ACCOUNTCOUNT - accountNumber; i++) {
        personal.newAccount("");
    }
}

console.log("Making every accounts balance 10 ethers...");

eth.accounts.forEach(function (account,index) {
     // Sometimes index of the coinbase account becomes different after creation of accounts, find it here
    if(eth.getBalance(account) > 1e30 ){
        coinBaseIndex = index;
    }
});
console.log("Coinbase account: ", coinBaseIndex);
eth.accounts.forEach(function (account, index) { // Send 10 ethers from account 0 to other accounts
    var balance = eth.getBalance(account);
    if (balance < 1e9 && index != coinBaseIndex) { // If account has less than 10 ethers send 10 ethers for gas costs 
        var tx = { from: eth.accounts[coinBaseIndex], to: account, value: 1e19 };
        personal.sendTransaction(tx, "");
    }
});

var blockCreationInterval = setInterval(function () { 
    // This interval causes accounts 0 and 1 to send ethers
    // to each other continuously so that new blocks created and now(block.timestamp) does not get stuck
    personal.unlockAccount(eth.accounts[0], '');
    var tx = { from: eth.accounts[0], to: eth.accounts[1], value: new BigNumber(1e18) };
    personal.sendTransaction(tx, "");

    personal.unlockAccount(eth.accounts[1], '');
    var tx = { from: eth.accounts[1], to: eth.accounts[0], value: new BigNumber(1e18) };
    personal.sendTransaction(tx, "");

}, 500);



// Random numbers that will be used to reveal
var randomNumbers = new Array();
var revealed = false;


// Ticket buying
eth.accounts.forEach(function (account,index) {
    personal.unlockAccount(eth.accounts[0], '');
    eip20network.transfer(account, 10, {
        from: eth.accounts[0]
    });
    personal.unlockAccount(account, '');
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
    console.log("Account ",index," buys a ticket with random hashed ",hashed);
});


var revealInterval = setInterval(function () {
    if(!revealed){
        console.log("Reveal: Trial");
        var isSubmission = bulotNetwork.isSubmissionStage();
        if (!isSubmission) {
            eth.accounts.forEach(function (account, index) {
                console.log("Account ",index," reveals his or her number ",randomNumbers[index]);
                personal.unlockAccount(account, '');
                bulotNetwork.revealNumber(randomNumbers[index], {
                    from: account
                });
            });
            revealed = true;
        } else {
            console.log("Reveal: 30 seconds for another trial.")
        } 
    }
}, 30 * 1000);

var withdrawInterval = setInterval(function () {
    console.log("Withdraw: Trial");
    var isSubmission = bulotNetwork.isSubmissionStage();
    var currentLotteryNo = bulotNetwork.getCurrentLotteryNo();

    if (isSubmission && currentLotteryNo == 2) {
        eth.accounts.forEach(function (account, index) {
            personal.unlockAccount(account, '');
            for (var j = 0; j < Math.ceil(Math.LOG2E * Math.log(ACCOUNTCOUNT*10)); j++) {  // This is how log2 is taken in geth console
                var prize = bulotNetwork.checkPrizeWon(1, j, account, {
                    from: account
                });
                if (prize > 0) {
                    console.log("Withdraw:", prize ,"tl prize won by account ", index," as ", j,"th winner.");
                    bulotNetwork.withdraw(1, j, {
                        from: account
                    });
                }
            }
        });
        clearInterval(revealInterval);
        clearInterval(withdrawInterval);
        console.log("Withdraw: Simulation ends..");
    } else {
        console.log("Withdraw: 30 seconds for another trial.")
    }

}, 30 * 1000);