pragma solidity ^0.4.18;

contract DarkRoom {
  struct Voter {
    bool vote;
    bool hasVoted;
  }

  mapping (address => Voter) voters;

  uint yes = 0;
  uint no = 0;

  event NewVote(uint totalYes, uint totalNo);

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

    emit NewVote(yes, no);
  }

  function getResults() public view returns (uint, uint) {
    return (yes, no);
  }

  function getVoter() public view returns (bool, bool) {
    Voter memory voter = voters[msg.sender];

    return (voter.vote, voter.hasVoted);
  }
}
