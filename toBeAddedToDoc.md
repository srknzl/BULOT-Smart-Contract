* If you want you can use watcher but test gives same events as console.log
* Unlock the account 0 in order to be able to deploy contracts.
* After deploying eip20, we recommend you to copy its address to test file and, if you want to use the watcher, to watcher.js to reduce your work
after deploying bulot.
* You need to copy its address to test file and ,if you want to use the watcher, to watcher.js file, then run the test via loadScript("test1.js") 
* Prepare loadScript("test1.js") in geth console so that you can quickly run the simulation after deploying the contract. 
* Remember you have 60 seconds until all the accounts can buy tickets, and because the loop is run sequentially (using forEach),it may take a little time to finish. We tested on up to 100 accounts 60 seconds is enough for the ticket buying stage whether or not accounts needs to be created or not. Creation of the accounts takes extra time.  