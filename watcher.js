loadScript('EIP20.js');
loadScript('BULOTContract.js');

var eip20address = "0x2BBea02eC8B5C84aA203Ab98D37172F31529a4D9";
var eip20network = web3.eth.contract(eip20abi).at(eip20address);

var bulotAddress = "0x1d892c4501CA594619B8ce5122F0C45BDAa68923";
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