loadScript('EIP20.js');
loadScript('BULOTContract.js');

var eip20address = "0xC06F1F30f07bD26623086971F8f58134B7F5E993";
var eip20network = web3.eth.contract(eip20abi).at(eip20address);

var bulotAddress = "0xb90EA388086e231070f1760443b3Ae0E3a63E7F5";
var bulotNetwork = web3.eth.contract(bulotContract).at(bulotAddress);

var ACCOUNTCOUNT = 10; // Number of accounts in the simulation
var coinBaseIndex = 0; // Sometimes index of the coinbase account becomes different
var totalPrize = 0; // Total prize given, accumulated in withdraw stage
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
if (accountNumber < ACCOUNTCOUNT) { // create more accounts if there aren't enough of them
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



// Random numbers that will be used to reveal.
var randomNumbers = new Array();
var revealed = false; // This is for checking if revealing ended so that console logs hidden in reveal interval 


// Ticket buying. Only accounts 0 to ACCOUNTNUMBER are attended to lottery.
eth.accounts.slice(0,ACCOUNTCOUNT).forEach(function (account,index) {
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

// This will try to start reveal stage every 30 seconds. Only accounts 0 to ACCOUNTNUMBER are attended to lottery.
// Random numbers are in randomNumbers array that is formed in ticket buying stage.
var revealInterval = setInterval(function () {
    if(!revealed){
        console.log("Reveal: Trial");
        var isSubmission = bulotNetwork.isSubmissionStage();
        if (!isSubmission) {
            eth.accounts.slice(0,ACCOUNTCOUNT).forEach(function (account, index) {
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
// This will try to start withdraw stage every 30 seconds. Only accounts 0 to ACCOUNTNUMBER are attended to lottery.
// Math.LOG2E is the number that is used to convert ln result to log2. This is how log2 is done in geth as there is no Math.log2
// function. 
var withdrawInterval = setInterval(function () {
    console.log("Withdraw: Trial");
    var isSubmission = bulotNetwork.isSubmissionStage();
    var currentLotteryNo = bulotNetwork.getCurrentLotteryNo();

    if (isSubmission && currentLotteryNo == 2) { // Withdraw condition, first lottery ended and it is submission stage
        eth.accounts.slice(0,ACCOUNTCOUNT).forEach(function (account, index) {
            personal.unlockAccount(account, '');
            for (var j = 0; j < Math.ceil(Math.LOG2E * Math.log(ACCOUNTCOUNT*10)); j++) {  // This is how log2 is taken in geth console
                var prize = bulotNetwork.checkPrizeWon(1, j, account, {
                    from: account
                });
                if (prize > 0) {
                    console.log("Withdraw:", prize ,"tl prize won by account ", index," as ", j,"th winner.");
                    totalPrize += Number(prize);
                    bulotNetwork.withdraw(1, j, {
                        from: account
                    });
                }
            }
        });
        clearInterval(revealInterval);
        clearInterval(withdrawInterval);
        console.log("Withdraw: Simulation ends total prize given is ", totalPrize);
    } else {
        console.log("Withdraw: 30 seconds for another trial.")
    }

}, 30 * 1000);