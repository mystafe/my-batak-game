import React, { useState } from 'react';
import PlayerHand from './PlayerHand';
import Bidding from './Bidding';
import Trick from './Trick';
import ScoreBoard from './ScoreBoard';
import { createDeck, shuffleDeck, dealCards, values } from '../utils/gameLogic';

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
    playerNames: ['', '', '', ''], // Store player names
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
    const players = dealCards(deck);

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

  const playCard = (card) => {
    const { currentPlayer, currentTrick, players, scores } = gameState;
    const leadSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null;
    const playerHand = players[currentPlayer];

    // Check if the player has a card of the lead suit
    const hasLeadSuit = playerHand.some(c => c.suit === leadSuit);
    // Check if the player has a trump card (assuming "spades" are trump)
    const hasTrump = playerHand.some(c => c.suit === 'spades');

    // Validate the card to be played
    if (leadSuit) {
      if (card.suit !== leadSuit && hasLeadSuit) {
        setGameState({
          ...gameState,
          notification: `You must play a ${leadSuit} card!`,
        });
        return;
      } else if (card.suit !== 'spades' && !hasLeadSuit && hasTrump) {
        setGameState({
          ...gameState,
          notification: `You must play a trump (spades) card!`,
        });
        return;
      }
    }

    // Proceed with the play
    const newTrick = [...currentTrick, { player: currentPlayer, card }];

    const newPlayers = players.map((hand, index) =>
      index === currentPlayer ? hand.filter(c => c !== card) : hand
    );

    if (newTrick.length === 4) {
      // Determine winner of the trick
      const trickWinner = determineTrickWinner(newTrick);

      // Update the score of the trick winner
      const newScores = [...scores];
      newScores[trickWinner] += 1;

      setGameState({
        ...gameState,
        currentTrick: [],
        players: newPlayers,
        currentPlayer: trickWinner, // Trick winner leads the next round
        scores: newScores, // Update scores
        notification: `${gameState.playerNames[trickWinner]} wins the trick!`, // Notify the winner
      });
    } else {
      setGameState({
        ...gameState,
        currentTrick: newTrick,
        players: newPlayers,
        currentPlayer: (currentPlayer + 1) % 4, // Next player's turn
      });
    }
  };

  const determineTrickWinner = (trick) => {
    const leadSuit = trick[0].card.suit;
    const trumpSuit = 'spades'; // Assuming spades are trump
    const validCards = trick.filter(({ card }) => card.suit === leadSuit || card.suit === trumpSuit);

    const winningCard = validCards.reduce((highest, current) => {
      const isHigher =
        (current.card.suit === trumpSuit && highest.card.suit !== trumpSuit) ||
        (current.card.suit === highest.card.suit && values.indexOf(current.card.value) < values.indexOf(highest.card.value));
      return isHigher ? current : highest;
    });

    return winningCard.player;
  };

  const getCardImage = (card) => {
    const imageName = `${card.value}_of_${card.suit}.png`;
    return `/src/assets/cards/${imageName}`;
  };

  return (
    <div className="game-board">
      <div className="scoreboard">
        <ScoreBoard scores={gameState.scores} />
      </div>
      <div className="notification">
        <p>{gameState.notification}</p>
      </div>
      {gameState.currentPhase === 'setup' && (
        <div className="player-setup">
          {gameState.playerNames.map((name, index) => (
            <div key={index}>
              <label>Player {index + 1} Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
              />
            </div>
          ))}
          <button className="start-game" onClick={startGame}>Start Game</button>
        </div>
      )}
      {gameState.currentPhase === 'bidding' && (
        <div className="bidding-section">
          <Bidding onBidComplete={handleBidComplete} />
        </div>
      )}
      {gameState.currentPhase === 'playing' && (
        <div>
          <Trick trick={gameState.currentTrick} />
          <div className="player-hand">
            {gameState.players[gameState.currentPlayer].map((card, index) => (
              <img
                key={index}
                src={getCardImage(card)}
                alt={`${card.value} of ${card.suit}`}
                onClick={() => playCard(card)}
                style={{ cursor: 'pointer', width: '100px', height: 'auto' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GameBoard;