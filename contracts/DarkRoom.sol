pragma solidity ^0.4.24;

contract DarkRoom {
  struct Voter {
    bool vote;
    bool hasVoted;
  }

  mapping (address => Voter) voters;

  uint yes = 0;
  uint no = 0;

  event NewVote(address lVoter, uint totalYes, uint totalNo);

  function vote(bool option) public {
    Voter storage voter = voters[msg.sender];
    require(!voter.hasVoted);

    if (option) {
      yes++;
    } else {
      no++;
    }

    voter.vote = option;
    voter.hasVoted = true;

    emit NewVote(msg.sender, yes, no);
  }

  function getResults() public view returns (uint, uint) {
    return (yes, no);
  }

  function getVoter() public view returns (address, bool, bool) {
    Voter memory voter = voters[msg.sender];

    return (msg.sender, voter.vote, voter.hasVoted);
  }
}
