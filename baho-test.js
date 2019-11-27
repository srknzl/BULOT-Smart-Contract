loadScript('EIP20.js');
loadScript('BULOTContract.js');

var eip20address = "0xB2f196741B73685981e38B79de1141D6309043BA";
var eip20network = web3.eth.contract(eip20abi).at(eip20address);

var bulotAddress = "0xCf5b1643a8fCE04b3c4b892Cbf3D6FEF6Bbda182";
var bulotNetwork = web3.eth.contract(bulotContract).at(bulotAddress);

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


var revealInterval = setInterval(function () {
    console.log("Revealing trial");
    var isSubmission = bulotNetwork.isSubmissionStage();
    if(isSubmission){
        console.log("Submission ended, revealing")
        personal.unlockAccount(eth.accounts[0], '');
        bulotNetwork.revealNumber(randomNumbers[0], {
            from: eth.accounts[0]
        });
    
        for (var i = 1; i < 1000; i++) { // Everyone buys a ticket 
            personal.unlockAccount(eth.accounts[i], 'pass');
            bulotNetwork.revealNumber(randomNumbers[i], {
                from: eth.accounts[i]
            });
        }
    }else {
        console.log("Submission not ended. Will try to start revealing again in 100 seconds.")
    }
    

}, 100 * 1000);

var withdrawInterval = setInterval(function () {
    console.log("Withdraw trial");
    var isSubmission = bulotNetwork.isSubmissionStage();
    var currentLotteryNo = bulotNetwork.getCurrentLotteryNo();

    if(isSubmission && currentLotteryNo == 2){

        personal.unlockAccount(eth.accounts[0], '');
        for(var i =0;i<15;i++){ // Log2 10000 = 14
            var prize = bulotNetwork.checkPrizeWon(1,i,eth.accounts[0], {
                from: eth.accounts[0]
            });
            if(prize > 0){
                bulotNetwork.withdraw(1,1, {
                    from: eth.accounts[0]
                });
            }
        }
       
    
        for (var i = 1; i < 1000; i++) {  
            personal.unlockAccount(eth.accounts[i], 'pass');
            for(var j =0;j<15;j++){ // Log2 10000 = 14
                var prize = bulotNetwork.checkPrizeWon(1,j,eth.accounts[i], {
                    from: eth.accounts[i]
                });
                if(prize > 0){
                    bulotNetwork.withdraw(1,j, {
                        from: eth.accounts[i]
                    });
                }
            }
        }
        clearInterval(revealInterval);
        clearInterval(withdrawInterval);
        console.log("Simulation ends..");
    }else {
        console.log("Lottery not ended. Will try to start withdrawing again in 100 seconds.")
       
    }
    
}, 100 * 1000);