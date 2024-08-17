import React, { useState, useEffect } from 'react';
import PlayerSetup from './PlayerSetup';
import Bidding from './Bidding';
import Trick from './Trick';
import ScoreBoard from './ScoreBoard';
import Notification from './Notification';
import PlayerHand from './PlayerHand';
import { shuffleDeck, values, determineTrickWinner, getCardImage } from '../utils/gameLogic';
import { startGame, handleBid } from '../utils/gameActions';

function GameBoard() {
  const [gameState, setGameState] = useState({
    deck: [],
    players: [[], [], [], []],
    bids: [null, null, null, null],
    tricksWon: [0, 0, 0, 0],
    currentTrick: [],
    scores: [0, 0, 0, 0],
    currentPlayer: 0,
    declarer: null,
    currentPhase: 'setup',
    playerNames: ['Mustafa', 'Player 2', 'Player 3', 'Player 4'],
    notification: '',
    trumpSuit: null,
    bidOrder: [],
    roundCount: 0,
    trickLog: [],
  });

  const handleNameChange = (index, name) => {
    const newPlayerNames = [...gameState.playerNames];
    newPlayerNames[index] = name;
    setGameState({ ...gameState, playerNames: newPlayerNames });
  };

  useEffect(() => {
    if (gameState.currentPhase === 'bidding') {
      const bidOrder = shuffleDeck([0, 1, 2, 3]);
      setGameState((prevState) => ({
        ...prevState,
        bidOrder,
        currentPlayer: bidOrder[0],
        notification: `${prevState.playerNames[bidOrder[0]]}, it's your turn to bid!`,
      }));
    }
  }, [gameState.currentPhase]);

  const handleTrumpSelection = (suit) => {
    setGameState((prevState) => ({
      ...prevState,
      trumpSuit: suit,
      currentPhase: 'playing',
      currentPlayer: prevState.declarer,
      notification: `${prevState.playerNames[prevState.declarer]} selected ${suit} as the trump suit. Let the game begin!`,
      players: prevState.players.length === 4 ? prevState.players : [[], [], [], []],
    }));

    setTimeout(() => {
      setGameState((prevState) => ({
        ...prevState,
        notification: `${prevState.playerNames[prevState.declarer]}'s turn to play a card.`,
      }));
    }, 3000);
  };

  const handlePlayCard = (card) => {
    console.log(`Player ${gameState.currentPlayer + 1} played:`, card);

    const { currentPlayer, currentTrick, players, trickLog, playerNames, trumpSuit } = gameState;
    const currentSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : card.suit;
    const playerHand = players[currentPlayer];

    // Check if the player has a card of the current suit
    const sameSuitCards = playerHand.filter(c => c.suit === currentSuit);
    const trumpCards = playerHand.filter(c => c.suit === trumpSuit);

    if (sameSuitCards.length > 0 && card.suit !== currentSuit) {
      alert(`${playerNames[currentPlayer]}, you must follow suit and play a ${currentSuit} card!`);
      return; // Prevent the card from being played
    } else if (sameSuitCards.length === 0 && trumpCards.length > 0 && card.suit !== trumpSuit) {
      alert(`${playerNames[currentPlayer]}, you must play a trump card if you don't have a ${currentSuit} card!`);
      return; // Prevent the card from being played
    }

    // Proceed with playing the card
    const newTrick = [...currentTrick, { player: currentPlayer, card }];
    const newPlayers = players.map((hand, index) =>
      index === currentPlayer ? hand.filter(c => c !== card) : hand
    );

    const newTrickLog = [...trickLog, `${playerNames[currentPlayer]} played ${card.value} of ${card.suit}`];

    if (newTrick.length === 4) {
      const trickWinner = determineTrickWinner(newTrick, trumpSuit);
      setGameState({
        ...gameState,
        currentTrick: [],
        players: newPlayers,
        currentPlayer: trickWinner,
        notification: `${playerNames[trickWinner]} wins the trick!`,
        trickLog: newTrickLog,
      });
    } else {
      setGameState({
        ...gameState,
        currentTrick: newTrick,
        players: newPlayers,
        currentPlayer: (currentPlayer + 1) % 4,
        notification: `${playerNames[(currentPlayer + 1) % 4]}'s turn to play a card.`,
        trickLog: newTrickLog,
      });
    }
  };

  const handleEndRound = () => {
    const { declarer, bids, tricksWon, scores, roundCount } = gameState;
    const newScores = [...scores];

    if (tricksWon[declarer] < bids[declarer]) {
      newScores[declarer] -= bids[declarer] * 10;
    }

    for (let i = 0; i < 4; i++) {
      newScores[i] += tricksWon[i] * 10;
    }

    const newRoundCount = roundCount + 1;

    if (newRoundCount >= 13) {
      // End the game after 13 rounds
      setGameState({
        ...gameState,
        scores: newScores,
        currentPhase: 'end',
        notification: `Game over. Final scores: ${newScores.join(', ')}`,
        trickLog: [], // Clear the trick log
      });
    } else {
      // Continue to the next round
      setGameState({
        ...gameState,
        scores: newScores,
        roundCount: newRoundCount,
        currentPhase: 'bidding',
        notification: `Round ${newRoundCount} complete. Next round begins.`,
        trickLog: [], // Clear the trick log
      });
    }
  };

  return (
    <div className="game-board">
      <ScoreBoard scores={gameState.scores} playerNames={gameState.playerNames} />
      <Notification message={gameState.notification} />
      {gameState.currentPhase === 'setup' && (
        <PlayerSetup
          playerNames={gameState.playerNames}
          handleNameChange={handleNameChange}
          startGame={() => startGame(setGameState)}
        />
      )}
      {gameState.currentPhase === 'bidding' && (
        <Bidding
          playerNames={gameState.playerNames}
          currentPlayer={gameState.currentPlayer}
          handleBid={(index, bid) => handleBid(index, bid, gameState, setGameState)}
          gameState={gameState}
        />
      )}
      {gameState.currentPhase === 'chooseTrump' && (
        <div className="trump-selection">
          <h3>{gameState.playerNames[gameState.declarer]}, choose the trump suit:</h3>
          <button onClick={() => handleTrumpSelection('hearts', gameState, setGameState)}>Hearts</button>
          <button onClick={() => handleTrumpSelection('diamonds', gameState, setGameState)}>Diamonds</button>
          <button onClick={() => handleTrumpSelection('clubs', gameState, setGameState)}>Clubs</button>
          <button onClick={() => handleTrumpSelection('spades', gameState, setGameState)}>Spades</button>
        </div>
      )}
      {gameState.currentPhase === 'playing' && (
        <div>
          <Trick trick={gameState.currentTrick} playerNames={gameState.playerNames} />
          <PlayerHand
            cards={gameState.players[gameState.currentPlayer]}
            playCard={handlePlayCard}
          />
          <div className="trick-log">
            {gameState.trickLog.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      )}
      {gameState.currentPhase === 'end' && (
        <div>
          <h3>Round Over. Scores:</h3>
          <ScoreBoard scores={gameState.scores} playerNames={gameState.playerNames} />
          <button onClick={() => startGame(setGameState)}>Start New Game</button>
        </div>
      )}
    </div>
  );
}

export default GameBoard;