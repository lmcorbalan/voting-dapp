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
    NO: 0
  };

  darkRoomInstance = null;

  account = '';

  vote = (option) => () => {
    console.log('voting', option);
    this.darkRoomInstance.vote(option, {from: this.account})
      .then((result) => {
        console.log('vote', result);
      });
  }

  onNewVote = (error, result) => {
    console.log(error);
    if (!error) {
      console.log(result);
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

        this.darkRoomInstance.NewVote(this.onNewVote);

        return this.darkRoomInstance.getVoter.call(this.account)
      }).then((result) => {
        console.log('voter', result);
        return this.darkRoomInstance.getResults.call(this.account)
      }).then((result) => {
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
              <button onClick={this.vote(true)}>YES</button>
              <button onClick={this.vote(false)}>NO</button>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
