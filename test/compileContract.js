//using web3 0.20.1
const fs = require("fs");
const solc = require('solc')
const Web3 = require("web3")
const location = './build/contracts/LendingClubCompiled.json'
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
const contractName = ':LendingClub'

let source = fs.readFileSync('./contracts/LendingClub.sol');
let compiled = solc.compile(source.toString(), 1);

let bytecode = '0x' + compiled["contracts"][contractName]["bytecode"]
let abi = compiled.contracts[contractName].interface;
let gasEstimate = web3.eth.estimateGas({data: bytecode});
let MyContract = web3.eth.contract(JSON.parse(abi));

fs.writeFileSync(location, JSON.stringify(compiled));
console.log("Compilation to " + location + " was successfull");

//CHECKING PAYOUT
// const location = './build/contracts/LendingClubCompiled.json'
// const Web3 = require("web3")
// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
// const location = './LendingClubCompiled.json'
// const contractName = ':LendingClub'
// let source = JSON.parse(fs.readFileSync(location).toString())
// let abi = source.contracts[contractName].interface;
// let deployedAddress = "0xeFD3f64643F1dea58a85E434FB4A7D761244B6DF"
// const contract = new web3.eth.Contract(JSON.parse(abi), deployedAddress)



//*******************************
//      Asynchronous Deployment
//*******************************

// const address= "0xE7Af206CCE9b20B49e8Af08f8E78F614165E02eb"

// var myContractReturned = MyContract.new(["0xff7739843dd35421D64D0133dE2107C80F64C5A3","0xE7Af206CCE9b20B49e8Af08f8E78F614165E02eb"]
// , 100000000, 0, {
//   from:address,
//   data:bytecode,
//   gas:4712388}, function(err, myContract){
//    if(!err) {
//       // NOTE: The callback will fire twice!
//       // Once the contract has the transactionHash property set and once its deployed on an address.
//        // e.g. check tx hash on the first call (transaction send)
//       if(!myContract.address) {
//           console.log(myContract.transactionHash) // The hash of the transaction, which deploys the contract
//
//       // check address on the second call (contract deployed)
//       } else {
//           console.log(myContract.address) // the contract address
//       }
//        // Note that the returned "myContractReturned" === "myContract",
//       // so the returned "myContractReturned" object will also get the address set.
//    }
//  });

// require('repl').start({})


//***********************
//      Synchronous Version
//*************************
// var myContractInstance = MyContract.new(["0xff7739843dd35421D64D0133dE2107C80F64C5A3","0xE7Af206CCE9b20B49e8Af08f8E78F614165E02eb"]
// , 100000000,0, {data: bytecode, gas: 4712388, from: address, gasPrice: 100000000000});
//
// global.myCon = myContractInstance
// console.log(myContractInstance.transactionHash) // The hash of the transaction, which created the contract
// console.log(myContractInstance.address) // undefined at start, but will be auto-filled later
