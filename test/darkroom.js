var DarkRoom = artifacts.require("./DarkRoom.sol");

contract('DarkRoom', function(accounts) {

  it("should get the right initial totals.", function() {
    return DarkRoom.deployed().then(function(instance) {
      darkRoomInstance = instance;

      return darkRoomInstance.getResults({from: accounts[0]});
    }).then(function(result) {
      assert.equal(result[0], 0, "It should not be any vote for YES.");
      assert.equal(result[1], 0, "It should not be any vote for NO.");
    });
  });

  it("should get the right voter status before voting.", function() {
    return DarkRoom.deployed().then(function(instance) {
      darkRoomInstance = instance;

      return darkRoomInstance.getVoter({from: accounts[0]});
    }).then(function(result) {
      assert.equal(result[0], accounts[0], "It should return the right voter address.");
      assert.equal(result[2], false, "Voter should not been voted yet.");
    });
  });

  it("should get the right total of YES after voting.", function() {
    return DarkRoom.deployed().then(function(instance) {
      darkRoomInstance = instance;

      return darkRoomInstance.vote(true, {from: accounts[0]});
    }).then(function(result) {
      return darkRoomInstance.getResults({from: accounts[0]});
    }).then(function(result) {
      assert.equal(result[0].toNumber(), 1, "It should be the right total for YES.");
      assert.equal(result[1].toNumber(), 0, "It should be the right total for NO.");
    });
  });

  it("should get the right total of NO after voting.", function() {
    return DarkRoom.deployed().then(function(instance) {
      darkRoomInstance = instance;

      return darkRoomInstance.vote(false, {from: accounts[1]});
    }).then(function(result) {
      return darkRoomInstance.getResults({from: accounts[1]});
    }).then(function(result) {
      assert.equal(result[0].toNumber(), 1, "It should be the right total for YES.");
      assert.equal(result[1].toNumber(), 1, "It should be the right total for NO.");
    });
  });

  it("should not allow to vote twice to the same acount", function() {
    return DarkRoom.deployed().then(function(instance) {
      darkRoomInstance = instance;

      return darkRoomInstance.vote(true, {from: accounts[0]});
    }).catch((err) => {
      assert.ok(err instanceof Error);
      assert.equal(err.message, "VM Exception while processing transaction: revert");
    })
  });

});
