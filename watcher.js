loadScript('EIP20.js');
loadScript('BULOTContract.js');

var eip20address = "0x6b45b74d4Dc29e352dd920BEb475b3E66B6fA926";
var eip20network = web3.eth.contract(eip20abi).at(eip20address);

var bulotAddress = "0xcD524e7c2D07B94ADB8bA29f978E38415089445B";
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