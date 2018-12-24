class App {
  constructor() {
    this.web3Provider = null
    //objs
    this.account
    this.deployedContract
    this.contractInstance

    this.contractAddress = ''
    this.numParticipantsPayed = 0
    this.contractParticipants = []
    this.potentialWinners = []
    this.roundsLeft = 0
    this.amountPerPerson = 0
    this.contractBalance = 0
    // this.txHashs = []
    this.paymentTxHash = ''
    this.payoutTxHash = ''
    this.lastPayoutWinner = ''
    this.lastPaymentFrom = ''

  }

  init() {
    this.initWeb3();
    this.clickEventHandlers()
    this.eventLoop()
  }

  initWeb3() {
    if (web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      this.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
      console.log("meta mask found ");
      console.log("version: " + web3.version.api);
    } else {
      // Specify default instance if no web3 instance provided
      console.log("meta mask found here ");
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(web3.currentProvider);
    }
    this.checkWeb3Network()
    return this.initContract()
  }
  initContract() {
    $.getJSON("/content/LendingClub.json", (compiled) => {
      this.contractInstance = TruffleContract(compiled)
      // Connect provider to interact with contract
      this.contractInstance.setProvider(this.web3Provider)
      //getting and setting network ID
      web3.version.getNetwork((err, netId) => {
        if (netId) {
          this.contractInstance.setNetwork(netId);
        } else {
          console.log(err);
        }
      })
    })
  }

  /**
   * @desc deploys the contract to blockchain with given args loading from builded contracts json file
   * @param String Array addresses - the addresses participating
   * @param int amountPerPerson - the requested amount per Person in Wei
   * @param int payoutTime - the requested time after which payout is possible in seconds
   */

  setContractDetails(addresses, amountPerPerson, payoutTime) {
    //if contract is not deployed already set new contract
    if (!this.deployedContract) {
      this.contractInstance.new({
        from: this.account
      }).then((instance) => {
        // this.instance.then((deployed) => this.deployedContract = deployed));
        this.deployedContract = instance
        return instance.setContractDetails(addresses, amountPerPerson, payoutTime);
      }).then((result) => {
        this.initializeAppState()
        this.listenForEvents()
      }).catch(e => {
        console.log(e)
      })
    }
    //setting new contract details to exsisiting Contract (after all rounds finished)
    else {
      this.deployedContract.setContractDetails(addresses, amountPerPerson, payoutTime)
        .then((result) => {
          this.initializeAppState()
          this.listenForEvents()
        }).catch(e => {
          console.log(e)
        })
    }
  }

  //Interact with already deployed contract
  deployedContractInstance(address) {
    this.contractInstance.at(address).then((deployedContract) => {
      this.deployedContract = deployedContract
      this.initializeAppState()
      this.listenForEvents()
    }).catch((e) => {
      console.log(e);
    })
  }

  //setting the App state to the State of the contract
  initializeAppState(stateInitialization) {
      //setting contract address
      this.contractAddress = this.deployedContract.address
      //setting  required transaction amount
      this.deployedContract.amountPerPerson().then((amount) => {
        this.amountPerPerson = amount.toString()
      })
      //resetting contractParticipants if new initialization
      if(this.contractParticipants.length) this.contractParticipants = []
      //looping through participanats Array and setting Winners as well
      this.deployedContract.getParticipantsCount().then((numParticipants) => {
        for (var i = 0; i < numParticipants.toString(); i++) {
          this.deployedContract.contractParticipants(i).then((participant) => {
            this.contractParticipants.push(participant)
            //because potential winners = contract Participants at initialization
            this.potentialWinners.push(participant)
            //because roundsLeft = amount of potential Winners
            this.roundsLeft = this.potentialWinners.length
          })
        }
      })
    }

  setBalance(){
    web3.eth.getBalance(this.contractAddress, (err, res) => {
        if (!err) {
          this.contractBalance = res.toString(10)
        } else {
          console.log(err);
        }
      })
  }

  //sending payment to contract
  sendPaymentToContract() {
    if (this.deployedContract) {
      this.deployedContract.deposit({
        value: this.amountPerPerson
      }).then((res) => {
      }).catch((e) => {
        console.log(e)
      })
    } else {
      alert('please define contract first')
    }
  }
  //initializing payout process to random participant
  initializePayout() {
    if (this.deployedContract) {
      this.deployedContract.initializePayoutProcess().then((txHash) => {
      }).catch((e) => console.log(e))
    } else {
      alert("please define a contract first")
    }
  }
  //listen for events to update the State
  listenForEvents() {
    //address field is already set by default to the contract address
    let options = {
      fromBlock: 0,
      toBlock: 'latest'
    }
    this.deployedContract.withdrawBackEvent(options).watch((err, event) => {
      alert("participant withdrew his funds! ", event)
      this.setBalance()
    })
    this.deployedContract.participantPayedEvent(options).watch((err, event) => {
      //this.numParticipantsPayed - this.contractParticipants.length
      this.paymentTxHash = event.transactionHash
      this.setBalance()
    })
    this.deployedContract.participantWonEvent(options).watch((err, event) => {
      this.contractBalance = 0
      this.lastPayoutWinner = event.args['_winner']
      this.potentialWinners = this.potentialWinners.filter(e => e !== this.lastPayoutWinner)
      this.roundsLeft = this.potentialWinners.length
      this.payoutTxHash = event.transactionHash
      this.setBalance()
    })
  }



  clickEventHandlers() {
    $('#initexsistingContract').click(() => {
      let contractAddress = $('.exsistingContractChip')[0].M_Chips.chipsData[0].tag
      this.deployedContractInstance(contractAddress)
    })

    $('#initContract').unbind().click(() => {
      let addresses = []
      $('.chips-addresses')[0].M_Chips.chipsData.forEach((e) => {
        addresses.push(e.tag)
      })
      let payoutTime = $('#payoutTime').val()
      let amountPerPerson = $('#amountPerPerson').val()
      //calling contract init function!
      this.setContractDetails(addresses, amountPerPerson, payoutTime)
      //clearing form data
      $('.chips').chips('deleteChip')
      $('#contractForm').trigger("reset");
    })

    $('#sendPayment').unbind().click(() => {
      this.sendPaymentToContract()
    })
    $('#initializePayout').unbind().click(() => {
      this.initializePayout()
    })
  }

  render() {
    // showing and hiding content
    //setting contract Data to UI
    //TODO use only classes
    if (this.deployedContract) {
      // if (this.potentialWinners > 0) $('#contactCreation').hide();
      if (this.roundsLeft > 0){
        $('#contactCreation').hide();
      } else {
        $('#contactCreation').show();
      }
      $('#contractBalance').html(this.contractBalance);
      $('.contractpayOutTxHash').html(this.payoutTxHash)
      $('.contractAddress').html(this.contractAddress);
      $('.contractAmountPerPerson').html(this.amountPerPerson)
      $('.paymentTxHash').html(this.paymentTxHash)
      $('#contractParticipants').html(this.contractParticipants);
      $('#contractWinner').html(this.lastPayoutWinner)
      $('.contractParticipantsAddresses').html(this.contractParticipants.join('<br>'))
      $('.contractPotentialWinnerAddresses').html(this.potentialWinners.join('<br>'))
      $('.contractRoundsLeft').html(this.roundsLeft)
    }

  }

  //listening for account changes of user with unpractical interval
    //recommended by Meta Mask though
  eventLoop() {
    this.account = web3.eth.accounts[0];
    setInterval((function() {
      this.render()
      if (web3.eth.accounts[0] !== this.account) {
        this.account = web3.eth.accounts[0];
        console.log("changed account using " + this.account);
      }
    }).bind(this), 1000);

  }
  //**************************************
  //        Helper functions
  //**************************************
  checkWeb3Network() {
    web3.version.getNetwork((err, netId) => {
      switch (netId) {
        case "1":
          console.log('This is mainnet')
          break
        case "2":
          console.log('This is the deprecated Morden test network.')
          break
        case "3":
          console.log('This is the ropsten test network.')
          break
        case "4":
          console.log('This is the Rinkeby test network.')
          break
        case "42":
          console.log('This is the Kovan test network.')
          break
        default:
          console.log('This is an unknown network.' + netId)
      }
    })
  }
}

$(function() {
  $(window).load(function() {
    app = new App()
    app.init();
  });
});
