import React, { useState } from 'react';
import PlayerSetup from './PlayerSetup';
import Bidding from './Bidding';
import Trick from './Trick';
import ScoreBoard from './ScoreBoard';
import Notification from './Notification';
import PlayerHand from './PlayerHand';
import { createDeck, shuffleDeck, dealCards, values, playCard, sortHand } from '../utils/gameLogic';

function GameBoard() {
  const [gameState, setGameState] = useState({
    deck: [],
    players: [[], [], [], []],
    bids: [],
    tricksWon: [0, 0, 0, 0], // Track tricks won by each player
    currentTrick: [],
    scores: [0, 0, 0, 0], // Scores for each player
    currentPlayer: 0,
    declarer: null,
    currentPhase: 'setup', // Initial phase is "setup"
    playerNames: ['Mustafa', 'Player 2', 'Player 3', 'Player 4'], // Default player names
    notification: '', // Notification message to be displayed
  });

  const handleNameChange = (index, name) => {
    const newPlayerNames = [...gameState.playerNames];
    newPlayerNames[index] = name;
    setGameState({ ...gameState, playerNames: newPlayerNames });
  };

  const startGame = () => {
    let deck = createDeck();
    deck = shuffleDeck(deck);
    const players = dealCards(deck).map(hand => {
      const sortedHand = sortHand(hand);
      console.log('Sorted Hand:', sortedHand); // Debugging line
      return sortedHand;
    });

    setGameState({
      ...gameState,
      deck,
      players,
      currentTrick: [],
      tricksWon: [0, 0, 0, 0], // Reset tricks won for the new game
      scores: [0, 0, 0, 0], // Reset scores for the new game
      currentPhase: 'bidding', // Transition to bidding phase after starting the game
      notification: '', // Reset notifications
    });
  };

  const handleBidComplete = (bids) => {
    const highestBid = Math.max(...bids);
    const declarer = bids.indexOf(highestBid);

    setGameState({
      ...gameState,
      bids,
      declarer,
      currentPhase: 'playing', // Move to the playing phase
      currentPlayer: declarer, // Set the current player to the declarer
      currentTrick: [],
      notification: `${gameState.playerNames[declarer]} starts the game!`,
    });
  };

  const determineTrickWinner = (trick) => {
    const leadSuit = trick[0].card.suit;  // The suit of the first card played
    const trumpSuit = 'spades'; // Assuming spades are trump
    let highestCard = trick[0].card;
    let winningPlayer = trick[0].player;

    trick.forEach(({ card, player }) => {
      if (card.suit === highestCard.suit) {
        if (values.indexOf(card.value) > values.indexOf(highestCard.value)) {
          highestCard = card;
          winningPlayer = player;
        }
      } else if (card.suit === trumpSuit && highestCard.suit !== trumpSuit) {
        highestCard = card;
        winningPlayer = player;
      }
    });

    return winningPlayer;
  };

  return (
    <div className="game-board">
      <ScoreBoard scores={gameState.scores} playerNames={gameState.playerNames} />
      <Notification message={gameState.notification} />
      {gameState.currentPhase === 'setup' && (
        <PlayerSetup
          playerNames={gameState.playerNames}
          handleNameChange={handleNameChange}
          startGame={startGame}
        />
      )}
      {gameState.currentPhase === 'bidding' && (
        <div className="bidding-section">
          <Bidding onBidComplete={handleBidComplete} playerNames={gameState.playerNames} />
        </div>
      )}
      {gameState.currentPhase === 'playing' && (
        <div>
          <Trick trick={gameState.currentTrick} playerNames={gameState.playerNames} />
          <PlayerHand
            cards={gameState.players[gameState.currentPlayer]}
            playCard={(card) => playCard(card, gameState, setGameState, determineTrickWinner, values)}
          />
        </div>
      )}
    </div>
  );
}

export default GameBoard;