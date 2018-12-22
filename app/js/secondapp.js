var work_account;

var StatusEnum = {
    NEW: 0,
    OPEN: 1,
    CLOSED: 2,
    ENDED: 3,
    properties: {
        0: {name: 'new'},
        1: {name: 'open'},
        2: {name: 'closed'},
        3: {name: 'ended'}
    }
};

var AlertType = {
    ALERT: 0,
    SUCCESS: 1,
    WARNING: 2,
    ERROR: 3
};

function refreshDashboard() {
  var bet = Bet.deployed();

  var ether_value = web3.fromWei(web3.eth.getBalance(bet.address), 'ether');
  var htmlElement = document.getElementById('balance');
  htmlElement.innerHTML = ether_value;

  bet.state().then(function(value) {
      var htmlElement = document.getElementById('state');
      htmlElement.innerHTML = StatusEnum.properties[value.valueOf()].name;
  }).catch(function(e) {
      console.error(e);
  });

  bet.pricelevel().then(function(value) {
      var htmlElement = document.getElementById('pricelevel');
      htmlElement.innerHTML = value.valueOf();
  }).catch(function(e) {
      console.error(e);
  });

};

function refreshInteraction(account) {
  var account_id_element = document.getElementById('account_id');
  account_id_element.innerHTML = account;

  var ether_value = web3.fromWei(account, 'ether');
  var htmlElement = document.getElementById('balance');
  htmlElement.innerHTML = Math.floor(ether_value);
};

function getAccount(index) {
    return new Promise(function (resolve) {
        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                throw 'Error fetching accounts.';
            }

            if (accs.length == 0) {
                throw 'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.';
            }

            if (index < 0 || index > accs.length - 1) {
                throw 'Index out of bounds, set an existing value for the index.';
            }

            resolve(accs[index]);
        });
    });
}

function updateButtons() {
    var bet = Bet.deployed();
    bet.state().then(function (state) {
        switch (parseInt(state)) {
            case StatusEnum.NEW:
                document.getElementById('create_new_bet').disabled = false;
                document.getElementById('place_bet').disabled = true;
                document.getElementById('close_betting').disabled = true;
                document.getElementById('pay').disabled = true;
                break;
            case StatusEnum.OPEN:
                document.getElementById('create_new_bet').disabled = true;
                document.getElementById('place_bet').disabled = false;
                document.getElementById('close_betting').disabled = false;
                document.getElementById('pay').disabled = true;
                break;
            case StatusEnum.CLOSED:
                document.getElementById('create_new_bet').disabled = true;
                document.getElementById('place_bet').disabled = true;
                document.getElementById('close_betting').disabled = true;
                document.getElementById('pay').disabled = false;
                break;
            case StatusEnum.ENDED:
                document.getElementById('create_new_bet').disabled = false;
                document.getElementById('place_bet').disabled = true;
                document.getElementById('close_betting').disabled = true;
                document.getElementById('pay').disabled = true;
                break;
            default:
                document.getElementById('create_new_bet').disabled = true;
                document.getElementById('place_bet').disabled = true;
                document.getElementById('close_betting').disabled = true;
                document.getElementById('pay').disabled = true;
        }
    });
}

function placeBet() {
    var betDateHtml = document.getElementById('bet_date').value;

    if (betDateHtml == '') {
        setStatus(AlertType.ERROR, 'Must specify a date.');
        throw 'Must specify a date.';
    }

    var dateElements = betDateHtml.split('-');
    var betDate = new Date(dateElements[0], dateElements[1], dateElements[2]);

    getAccount(0).then(function (account) {
        var bet = Bet.deployed();
        return bet.placeBet.sendTransaction(betDate.getTime(), {from: account});
    }).then(function(txHash) {
        setStatus(AlertType.WARNING, 'Sent transaction', 'TxHash: ' + txHash);
        console.log('Sent transaction', 'TxHash: ' + txHash);
        return web3.eth.getTransaction(txHash);
    }).then(function(transaction) {
        setStatus(AlertType.SUCCESS, 'Bet placed.');
        console.log('Bet placed.');
        updateButtons();
    }).catch(function(e) {
        setStatus(AlertType.ERROR, 'An error occured in the transaction. See log for further information.');
        console.error('Something went wrong: ' + e);
    });

}

function createBet() {
    var dollarValue = parseInt(document.getElementById('dollar_value').value);
    var endBettingDate = document.getElementById('end_betting_date').value;
    var prizeAmount = parseInt(document.getElementById('prize_amount').value);

    if (isNaN(dollarValue) || endBettingDate == '' || isNaN(prizeAmount)) {
        setStatus(AlertType.ERROR, 'Must specify a dollar value and/or enddate.');
        throw 'Must specify a dollar value and/or enddate.';
    }

    var dateElements = endBettingDate.split('-');
    var endDate = new Date(dateElements[0], dateElements[1], dateElements[2]);
    var prizeInWei = web3.toWei(prizeAmount, 'ether');

    getAccount(0).then(function (account) {
        var bet = Bet.deployed();
        return bet.create.sendTransaction(dollarValue, endDate.getTime(), {value: prizeInWei, from: account});
    }).then(function(txHash) {
        setStatus(AlertType.WARNING, 'Sent transaction', 'TxHash: ' + txHash);
        console.log('Sent transaction', 'TxHash: ' + txHash);
        return web3.eth.getTransaction(txHash);
    }).then(function(transaction) {
        setStatus(AlertType.SUCCESS, 'Bet created.');
        console.log('Bet created.');
        refreshDashboard();
        var bet = Bet.deployed();
        return bet.pricelevel();
    }).then(function (pricelevel) {
        console.log('pricelevel after: ' + pricelevel);
        var bet = Bet.deployed();
        return bet.enddate();
    }).then(function (enddate) {
        var endBettingDate = new Date();
        endBettingDate.setTime(enddate);
        console.log('enddate: ' + enddate + ', new enddate: ' + endBettingDate);
        updateButtons();
    }).catch(function(e) {
        setStatus(AlertType.ERROR, 'An error occured in the transaction. See log for further information.');
        console.error('Something went wrong: ' + e);
    });
}

function closeBetting() {
    getAccount(0).then(function (account) {
        var bet = Bet.deployed();
        bet.closeBetting.sendTransaction({from:account})
    }).then(function(txHash) {
        setStatus(AlertType.WARNING, 'Sent transaction', 'TxHash: ' + txHash);
        console.log('Sent transaction', 'TxHash: ' + txHash);
        return web3.eth.getTransaction(txHash);
    }).then(function(transaction) {
        setStatus(AlertType.SUCCESS, 'Betting closed.');
        console.log('Betting closed.');
        refreshDashboard();
        updateButtons();
    }).catch(function(e) {
        setStatus(AlertType.ERROR, 'An error occured in the transaction. See log for further information.');
        console.error('Something went wrong: ' + e);
    });
}

function payPrize() {
    getAccount(0).then(function (account) {
        var bet = Bet.deployed();
        bet.payout.sendTransaction(account, {from:account})
    }).then(function(txHash) {
        setStatus(AlertType.WARNING, 'Sent transaction', 'TxHash: ' + txHash);
        console.log('Sent transaction', 'TxHash: ' + txHash);
        return web3.eth.getTransaction(txHash);
    }).then(function(transaction) {
        setStatus(AlertType.SUCCESS, 'Prize paid out.');
        console.log('Prize paid out.');
        refreshDashboard();
        updateButtons();
    }).catch(function(e) {
        setStatus(AlertType.ERROR, 'An error occured in the transaction. See log for further information.');
        console.error('Something went wrong: ' + e);
    });
}

function hideMessage() {
    var statusMsgElement = document.getElementById('status_message');
    statusMsgElement.classList.add('hidden');
}

function setStatus(type, message) {
    var statusMsgElement = document.getElementById('status_message');
    statusMsgElement.classList.remove('hidden');

    var alertBoxElement = document.getElementById('alert_box');
    alertBoxElement.classList.remove('alert--success');
    alertBoxElement.classList.remove('alert--error');
    alertBoxElement.classList.remove('alert--warning');

    var iconElement = document.getElementById('status_icon');
    var messageElement = document.getElementById('message_content');

    switch (type) {
        case AlertType.SUCCESS:
            alertBoxElement.classList.add('alert--success');
            iconElement.innerHTML = 'stars';
            break;
        case AlertType.WARNING:
            alertBoxElement.classList.add('alert--warning');
            iconElement.innerHTML = 'warning';
            break;
        case AlertType.ERROR:
            alertBoxElement.classList.add('alert--error');
            iconElement.innerHTML = 'error_outline';
            break;
        default:
            iconElement.innerHTML = 'info_outline';
            // standard alerts do not need a special class
    };

    messageElement.innerHTML = message;
}

window.onload = function() {
    var base = window.location.href.split('/').pop();
    var filename = base.split('?')[0];

    console.log('Base: ' + base);
    console.log('Filename: ' + filename);

    switch (filename) {
        case 'interaction.html':
            updateButtons();
            getAccount(0).then(function (account) {
                refreshInteraction(account);
            }, function (reason) {
                console.error(reason);
            });
            break;
        case 'index.html':
            // fallthrough to default
        default:
            refreshDashboard();
            updateButtons();
    }
}
