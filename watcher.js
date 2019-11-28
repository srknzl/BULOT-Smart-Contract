loadScript('EIP20.js');
loadScript('BULOTContract.js');

var eip20address = "0x4af1202B6F80a10Ec1b46852fC758affE9cBee00";
var eip20network = web3.eth.contract(eip20abi).at(eip20address);

var bulotAddress = "0x2146276F32F36C9117964d7dba51E64E9F0E6453";
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