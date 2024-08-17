import React, { useState, useEffect } from 'react';
import PlayerSetup from './PlayerSetup';
import Bidding from './Bidding';
import Trick from './Trick';
import ScoreBoard from './ScoreBoard';
import Notification from './Notification';
import PlayerHand from './PlayerHand';
import { shuffleDeck, determineTrickWinner } from '../utils/gameLogic';
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

    const { currentPlayer, currentTrick, players, trickLog, playerNames, trumpSuit, roundCount } = gameState;
    const currentSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : card.suit;
    const playerHand = players[currentPlayer];

    const sameSuitCards = playerHand.filter(c => c.suit === currentSuit);
    const hasTrumpSuit = playerHand.some(c => c.suit === trumpSuit);

    if (sameSuitCards.length > 0 && card.suit !== currentSuit) {
      alert(`${playerNames[currentPlayer]}, you must follow suit and play a ${currentSuit} card!`);
      return;
    }

    if (sameSuitCards.length === 0 && card.suit !== trumpSuit && hasTrumpSuit) {
      alert(`${playerNames[currentPlayer]}, you must play a trump (${trumpSuit}) if possible!`);
      return;
    }

    const newTrick = [...currentTrick, { player: currentPlayer, card }];
    const newPlayers = players.map((hand, index) =>
      index === currentPlayer ? hand.filter(c => c !== card) : hand
    );

    const newTrickLog = [...trickLog, `${playerNames[currentPlayer]} played ${card.value} of ${card.suit}`];

    if (newTrick.length === 4) {
      const trickWinner = determineTrickWinner(newTrick, trumpSuit);

      // Increment the number of tricks won by the winning player
      const newTricksWon = [...gameState.tricksWon];
      newTricksWon[trickWinner] += 1;

      setGameState({
        ...gameState,
        currentTrick: [],
        players: newPlayers,
        currentPlayer: trickWinner,
        notification: `${playerNames[trickWinner]} wins the trick!`,
        trickLog: newTrickLog,
        tricksWon: newTricksWon, // Update tricks won
      });

      if (roundCount >= 12) {
        handleEndRound(gameState, setGameState); // End the game after 13 rounds
      } else {
        setGameState((prevState) => ({
          ...prevState,
          roundCount: prevState.roundCount + 1, // Move to the next round
        }));
      }
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
    const { declarer, bids, tricksWon, scores } = gameState;
    const newScores = [...scores];

    // Calculate points for the declarer
    if (tricksWon[declarer] < bids[declarer]) {
      // Declarer did not meet their bid, lose points
      newScores[declarer] -= bids[declarer] * 10;
    } else {
      // Declarer met or exceeded their bid, gain points
      newScores[declarer] += bids[declarer] * 10;
    }

    // Calculate points for other players based on the number of tricks won
    for (let i = 0; i < 4; i++) {
      if (i !== declarer) {
        newScores[i] += tricksWon[i] * 10;
      }
    }

    const newRoundCount = gameState.roundCount + 1;

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
        tricksWon: [0, 0, 0, 0], // Reset tricks won for the new round
        bids: [null, null, null, null], // Reset bids for the new round
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
            playCard={(card) => handlePlayCard(card, gameState, setGameState)}
          />
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