import React, { Component } from 'react'
import DarkRoomContract from '../build/contracts/DarkRoom.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  state = {
    YES: 0,
    NO: 0,
    shouldDisableVotes: true,
  };

  darkRoomInstance = null;

  account = '';

  vote = (option) => () => {
    console.log('voting', option);
    this.setState({ shouldDisableVotes: true });
    this.darkRoomInstance.vote(option, {from: this.account})
      .then((result) => {
        console.log('vote', result);
      });
  }

  onNewVote = (error, result) => {
    console.log(error);
    if (!error) {
      this.setState({ YES: result.args.totalYes.toNumber() });
      this.setState({ NO: result.args.totalNo.toNumber() });
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const darkRoom = contract(DarkRoomContract)
    darkRoom.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      darkRoom.deployed().then((instance) => {
        this.darkRoomInstance = instance
        this.account = accounts[0];
        console.log(accounts);
        console.log(this.account);

        this.darkRoomInstance.NewVote(this.onNewVote);

        return this.darkRoomInstance.getVoter({from: this.account});

      }).then(result => {
        console.log(result)

        const [_,myVote, hasVoted] = result;

        console.log('myVote', myVote);
        console.log('hasVoted', hasVoted);

        this.setState({ shouldDisableVotes: hasVoted });

        if (hasVoted) {
          this.setState({ myVote })
        }

        return this.darkRoomInstance.getResults({from: this.account});
      }).then(result => {
        console.log('results', result)
        this.setState({ YES: result[0].toNumber() });
        this.setState({ NO: result[1].toNumber() });
        const YES = result[0].toNumber();
        const NO = result[1].toNumber();
        console.log('YES', YES)
        console.log('NO', NO)
      })
    })
  }

  render() {

    const vote = this.state.shouldDisableVotes
      ? <h2>YOU VOTED: {this.state.myVote ? 'YES' : 'NO'}</h2>
      : (
        <div>
          <button onClick={this.vote(true)}>YES</button>
          <button onClick={this.vote(false)}>NO</button>
        </div>
      )

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>VOTE: YES - NO</h1>
              <p>YES: {this.state.YES}</p>
              <p>YES: {this.state.NO}</p>
              {vote}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
