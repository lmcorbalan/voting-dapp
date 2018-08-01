import React, { Component } from 'react';
import DarkRoomContract from '../build/contracts/DarkRoom.json';
import getWeb3 from './utils/getWeb3';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons'

library.add(faThumbsUp, faThumbsDown)

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

const IconVoteYes = () => <FontAwesomeIcon className="icon__yes" icon='thumbs-up' />;
const IconVoteNo = () => <FontAwesomeIcon className="icon__no" icon='thumbs-down' />

class App extends Component {
  state = {
    YES: 0,
    NO: 0,
    shouldDisableVotes: true
  };

  darkRoomInstance = null;

  account = '';

  vote = option => () => {
    this.darkRoomInstance
      .vote.sendTransaction(option, {
        from: this.account,
        value: this.state.web3.fromWei(this.votingFee, 'Gwei'),
        gas: 9999900,
        gasPrice: this.state.web3.toWei(182, 'Gwei')
      })
      .then(result => {
        const votedOption = option ? 'YES' : 'NO';
        const tempOption = this.state[votedOption] + 1;

        this.setState({
          shouldDisableVotes: true,
          myVote: option,
          [votedOption]: tempOption
        });
      })
      .catch(error => {
        console.error(error);
      });
  };

  handleNewVoteEvent = (error, result) => {
    if (!error) {
      this.setState({
        YES: result.args.totalYes.toNumber(),
        NO: result.args.totalNo.toNumber()
      });
    } else {
      console.error(error);
    }
  };

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        // Instantiate contract once web3 provided.
        this.instantiateContract();
      })
      .catch(() => {
        console.log('Error finding web3.');
      });
  }

  instantiateContract() {
    const contract = require('truffle-contract');
    const darkRoom = contract(DarkRoomContract);
    darkRoom.setProvider(this.state.web3.currentProvider);

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      darkRoom
        .deployed()
        .then(instance => {
          this.darkRoomInstance = instance;
          this.account = accounts[0];
          this.darkRoomInstance.NewVote(this.handleNewVoteEvent);

          return this.darkRoomInstance.getVotingFee({ from: this.account });
        })
        .then(result => {
          this.setState({ votingFee: result.toNumber() });

          return this.darkRoomInstance.getVoter({ from: this.account });
        })
        .then(result => {
          const [_, myVote, hasVoted] = result;
          this.setState({ shouldDisableVotes: hasVoted });

          if (hasVoted) {
            this.setState({ myVote });
          }

          return this.darkRoomInstance.getResults({ from: this.account });
        })
        .then(result => {
          this.setState({ YES: result[0].toNumber() });
          this.setState({ NO: result[1].toNumber() });
        });
    });
  }

  render() {
    const vote = this.state.shouldDisableVotes ? (
      <div className="vote-actions">
        <div>
          <h2>You Voted</h2>
        </div>
        <div>
          <span className={`vote-btn  ${this.state.myVote ? 'current-vote__yes' : 'current-vote__no'}`} >
          {this.state.myVote ? <IconVoteYes /> : <IconVoteNo />}
          </span>
        </div>
      </div>
    ) : (
      <div className="vote-actions">
        <div>
          <h2>What are you going to vote?</h2>
        </div>
        <div>
          <button className="vote-btn vote-btn__yes" onClick={this.vote(true)}><span><IconVoteYes /></span></button>
          <button className="vote-btn vote-btn__no" onClick={this.vote(true)}><span><IconVoteNo /></span></button>
        </div>
      </div>
    );

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">
            The Dark Room
          </a>
        </nav>
        <main className="container">
          <div>
            <h2>What people have voted so far</h2>
          </div>
          <div className="current-votes">
            <h2><IconVoteYes /> {this.state.YES}</h2>
            <h2><IconVoteNo /> {this.state.NO}</h2>
          </div>
          {vote}
        </main>
      </div>
    );
  }
}

export default App;
