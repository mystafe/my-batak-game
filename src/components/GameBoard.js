import React, { useState, useEffect } from 'react';
import PlayerSetup from './PlayerSetup';
import Bidding from './Bidding';
import Trick from './Trick';
import ScoreBoard from './ScoreBoard';
import Notification from './Notification';
import PlayerHand from './PlayerHand';
import TrickHistory from './TrickHistory';
import { calculateScores, shuffleDeck, handlePlayCard, calculatePlayableCards } from '../utils/gameLogic';
import { startGame, handleBid, handleTrumpSelection, handleEndRound, handleNewRound } from '../utils/gameActions';

function GameBoard() {
  const [gameState, setGameState] = useState({
    deck: [],
    players: [[], [], [], []],
    bids: [0, 0, 0, 0],
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
    trickHistory: [],
    hasTrumpBeenPlayed: false,
    leadSuit: null,
    highestCardValue: 0,
    playableCards: [],
  });

  useEffect(() => {
    if (gameState.currentPhase === 'bidding') {
      const bidOrder = shuffleDeck([0, 1, 2, 3]);
      if (gameState.playerNames.length === 4 && gameState.bids.length === 4) {
        setGameState((prevState) => ({
          ...prevState,
          bidOrder,
          currentPlayer: bidOrder[0],
          notification: `${prevState.playerNames[bidOrder[0]]}, it's your turn to bid!`,
        }));
      } else {
        console.error("Game data is incomplete!");
      }
    }
  }, [gameState.currentPhase, gameState.bids.length, gameState.playerNames.length]);

  useEffect(() => {
    if (gameState.roundCount >= 13) {
      endRound();
    }
  }, [gameState.roundCount, gameState.bids, gameState.tricksWon]);

  useEffect(() => {
    if (gameState.tricksWon.reduce((acc, val) => acc + val, 0) === 13) {
      handleEndRound(gameState, setGameState);
    }
  }, [gameState.tricksWon, gameState]);

  const handleNameChange = (index, name) => {
    const newPlayerNames = [...gameState.playerNames];
    newPlayerNames[index] = name;
    setGameState((prevState) => ({
      ...prevState,
      playerNames: newPlayerNames,
    }));
  };

  const handlePlayCardInGameBoard = (card) => {
    handlePlayCard(card, gameState, setGameState);
    updatePlayableCards();
  };

  const updatePlayableCards = () => {
    const nextPlayerIndex = gameState.currentPlayer % 4;
    const playableCards = calculatePlayableCards(gameState, nextPlayerIndex);
    setGameState(prevState => ({
      ...prevState,
      playableCards,
    }));
  };

  const endRound = () => {
    setGameState((prevState) => ({
      ...prevState,
      currentPhase: 'end',
      notification: 'Round complete. Scores updated.',
      trickLog: [],
      scores: calculateScores(gameState.bids, gameState.tricksWon),
    }));
  };

  return (
    <div className="game-board">
      {gameState.trumpSuit && (
        <div className="trump-suit">
          <h3>
            Trump Suit: {gameState.trumpSuit.charAt(0).toUpperCase() + gameState.trumpSuit.slice(1)}
            <br />
            Chosen by: {gameState.playerNames[gameState.declarer]} (Bid: {gameState.bids[gameState.declarer]})
          </h3>
        </div>
      )}
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
            playCard={handlePlayCardInGameBoard}
          />
          <TrickHistory trickHistory={gameState.trickHistory} />
        </div>
      )}
      {gameState.currentPhase === 'end' && (
        <div>
          <h3>{gameState.notification}</h3>
          <ScoreBoard scores={gameState.scores} playerNames={gameState.playerNames} />
          <button onClick={() => startGame(setGameState)}>Start New Game</button>
          <button onClick={() => handleNewRound(gameState, setGameState)}>Start New Round</button>
        </div>
      )}
    </div>
  );
}

export default GameBoard;