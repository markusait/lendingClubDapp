//lets write js test to simulate client side interactions with  mocka and chai

var lendingClub = artifacts.require("./LendingClub.sol");
//testing that contract was inizialied with correct number of candidates

contract("LendingClub", function(accounts) {
    // we want the election var to have scope in the entire test
    //cause we cannont reference the instance var!
    var lendingClubInstance;
    //testing that we have two candidates
    it("see if constructor was called correctly", function() {
        return LendingClub.deployed().then(function(instance) {
            return instance.contractParticipants.call(1)
        }).then(function(address) {
            assert.equal(address, "0xE7Af206CCE9b20B49e8Af08f8E78F614165E02eb");
        });
    });


    // it("it initializes the candidates with the correct values", function() {
    //     return Election.deployed().then(function(instance) {
    //         electionInstance = instance;
    //         return electionInstance.candidates(1);
    //     }).then(function(candidate) {
    //         assert.equal(candidate[0], 1, "contains the correct id");
    //         assert.equal(candidate[1], "Candidate 1", "contains the correct name");
    //         assert.equal(candidate[2], 0, "contains the correct votes count");
    //         return electionInstance.candidates(2);
    //     }).then(function(candidate) {
    //         assert.equal(candidate[0], 2, "contains the correct id");
    //         assert.equal(candidate[1], "Candidate 2", "contains the correct name");
    //         assert.equal(candidate[2], 0, "contains the correct votes count");
    //     });
    // });
});
