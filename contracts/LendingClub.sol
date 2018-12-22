pragma solidity ^0.4.0;//please import oraclizeAPI_pre0.4.sol when solidity < 0.4.0
contract LendingClub  {

  using SafeMath for uint;

  //Using time constraint later
  bool public payoutOverTime;
  uint public timeLimit;

  uint public amountPerPerson;
  uint public numParticipantsPayed;
  mapping(address => uint) public amountPayed;
  address[] public potentialWinners;
  address[] public contractParticipants;


  // event emitted if participant pays out his share
  event withdrawBackEvent (
        address indexed _withdrawer,
        uint indexed _amount
    );
  event participantPayedEvent(
        address indexed _sender,
        uint indexed _amount
  );
  event participantWonEvent(
        address indexed _winner,
        uint indexed _winnerId
  );

  //initialized after each round with all the addresses participating, amount to pay and time
  //another arg uint timeInSeconds
  function setContractDetails (address[] _participants, uint _amountPerPersonInWei,  uint _timeLimitInSeconds ) public {
    require(potentialWinners.length == 0 );
    // state = LendingClubState.Accepting;
    contractParticipants = _participants;
    potentialWinners = _participants;
    amountPerPerson = _amountPerPersonInWei;
    numParticipantsPayed = 0;
    if(_timeLimitInSeconds > 0){
      timeLimit = _timeLimitInSeconds;
    }
  }

  //this function is called by each address that is participating
  //requires everyone to pay it amount y every x time
  function deposit() public payable {
    // should also require that msg.owner is part of contractParticipants
    require(msg.value >= amountPerPerson);
    amountPayed[msg.sender] = msg.value;
    numParticipantsPayed++;
    emit participantPayedEvent(msg.sender,msg.value);
  }

  //should require multi sig here as well
  function initializePayoutProcess() public {
    // could double checking with for loop if everyone payed the correct ammount
    // require(numParticipantsPayed * amountPerPerson >= this.balance)
    //require(payoutOverTime >= now);
    require(numParticipantsPayed >= contractParticipants.length && potentialWinners.length > 0);
    for(uint i= 0; i < contractParticipants.length; i++){
      require(amountPayed[contractParticipants[i]] >= amountPerPerson);
    }
    withdrawToRandomParticipant();
  }

  // Pseudo randomness implementtion should not be used in production!
  // Explanation: Current block.difficulty and block.timestamp are being hashed and encoded as a number.
  // After encoding 256 bit hash to 256 bit integer, we are taking reminder by dividing 251,
  // to get an integer in a range from [0, 250]. In our case 251 is prime number
  // Note  Hashing is not important here just using it to get fixed length bits.
  // Biggest Problem is that both block.timestamp and block.difficulty are dependend on miners!
  function random() private view returns (uint8) {
    if(potentialWinners.length > 1) {
      uint num = potentialWinners.length - 1;
      return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % (potentialWinners.length - 1));
      //only one person left return index 0
    } else {
      return 0;
    }

  }

  //withdrawing to the randomly selected participant
  function withdrawToRandomParticipant() internal {
    uint winnerIndex = random();
    address winnerAddress = potentialWinners[winnerIndex];
    winnerAddress.transfer(address(this).balance);
    emit participantWonEvent(winnerAddress, winnerIndex);
    setNewRound(winnerAddress, winnerIndex);
  }

  //decrementing rounds by removing the winner from potentialWinners Array
  function setNewRound(address _winnerAddress, uint winnerIndex) internal {
    removeFromPotentialWinners(winnerIndex);
    numParticipantsPayed = 0;
    //lets make it work with a struct
    for(uint i = 0; i < contractParticipants.length; i++){
      amountPayed[contractParticipants[i]] = 0;
    }
  }

  /* HELPER FUNCTIONS*/

  function getParticipantsCount() public constant returns(uint count) {
    return contractParticipants.length;
  }

  function getPotentialWinnersCount() public constant returns(uint count) {
    return potentialWinners.length;
  }



  function stringToUint(string s) constant returns (uint result) {
        bytes memory b = bytes(s);
        uint i;
        result = 0;
        for (i = 0; i < b.length; i++) {
            uint c = uint(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
    }

  function removeFromPotentialWinners(uint _index) internal {
      require(_index < potentialWinners.length);
      potentialWinners[_index] = potentialWinners[potentialWinners.length-1];
      delete potentialWinners[potentialWinners.length-1];
      potentialWinners.length--;
    }

  //Withdrawing back to participant (only possible if he/she has payed the full amount )
  function withdrawBack(address _participantAddress) public {
    //require(_participantAddress == msg.sender);
    require(amountPayed[_participantAddress] >= amountPerPerson);
    amountPayed[_participantAddress] = 0;
    numParticipantsPayed--;
    _participantAddress.transfer(amountPerPerson);
    emit withdrawBackEvent(_participantAddress, amountPerPerson);
  }
}
//<Safe Math Libary>
/**
 * @title SafeMath
 * @dev Math operations with safety checks that revert on error
 */
library SafeMath {
    /**
    * @dev Multiplies two numbers, reverts on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    /**
    * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
    * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
    * @dev Adds two numbers, reverts on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
    * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
    * reverts when dividing by zero.
    */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}



// </Safe Math Libary>
