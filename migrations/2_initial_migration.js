//truffle contract abstraction via arifacts
var LendingClub = artifacts.require("LendingClub.sol");

module.exports = function(deployer) {
  //Deploying it
  deployer.deploy(LendingClub);

};
