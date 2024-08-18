import React, { useState, useEffect } from 'react';
import PlayerSetup from './PlayerSetup';
import Bidding from './Bidding';
import Trick from './Trick';
import ScoreBoard from './ScoreBoard';
import Notification from './Notification';
import PlayerHand from './PlayerHand';
import { calculateScores, shuffleDeck, isValidPlay } from '../utils/gameLogic';
import { startGame, handleBid, handleTrumpSelection, handleEndRound, handleEndTrick, handleNewRound } from '../utils/gameActions';

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
      setGameState({
        ...gameState,
        currentPhase: 'end',
        notification: 'Round complete. Scores updated.',
        trickLog: [],
        scores: calculateScores(gameState.bids, gameState.tricksWon),
      });
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState.tricksWon.reduce((acc, val) => acc + val, 0) === 13) {
      handleEndRound(gameState, setGameState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.tricksWon]);  // Bu kısmı tricksWon'u izleyerek güncelliyoruz.
  const handleNameChange = (index, name) => {
    const newPlayerNames = [...gameState.playerNames];
    newPlayerNames[index] = name;
    setGameState({ ...gameState, playerNames: newPlayerNames });
  };

  const handlePlayCard = (card) => {
    const { currentPlayer, currentTrick, players, trumpSuit } = gameState;
    const playerHand = players[currentPlayer];

    // Yeni geçerli oynama kontrolü
    if (!isValidPlay(card, currentTrick, playerHand, trumpSuit)) {
      return;
    }

    // Oyuncu oynayabilir, işlemler devam eder
    const newTrick = [...currentTrick, { player: currentPlayer, card }];
    const newPlayers = players.map((hand, index) =>
      index === currentPlayer ? hand.filter(c => c !== card) : hand
    );

    setGameState({
      ...gameState,
      currentTrick: newTrick,
      players: newPlayers,
      currentPlayer: (currentPlayer + 1) % 4,
      notification: `${gameState.playerNames[(currentPlayer + 1) % 4]}'s turn to play a card.`,
    });

    if (newTrick.length === 4) {
      handleEndTrick(gameState, setGameState); // Trick bitişini ele al
    }
  };

  // Round tamamlandığında güncellenen mesaj:
  useEffect(() => {
    if (gameState.currentPhase === 'end') {
      setGameState((prevState) => ({
        ...prevState,
        notification: 'Round complete. Scores updated.',
      }));
    }
  }, [gameState.currentPhase]);

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
            playCard={(card) => handlePlayCard(card, gameState, setGameState)}
          />
          <div className="trick-history">
            <h4>Trick History</h4>
            <ul>
              {gameState.trickHistory.map((trick, index) => (
                <li key={index}>
                  <div>Trick {trick.trickNumber} started.</div>
                  {trick.plays.map((play, idx) => (
                    <div key={idx}>{`${play.playerName} played ${play.card.value} of ${play.card.suit}`}</div>
                  ))}
                  <div>Trick {trick.trickNumber} winner: {trick.winner}</div>
                  <div className="trick-summary">
                    <table>
                      <tbody>
                        <tr>
                          <td>Mustafa</td>
                          <td>{trick.totalScores[0]}</td>
                          <td>Player 2</td>
                          <td>{trick.totalScores[1]}</td>
                        </tr>
                        <tr>
                          <td>Player 3</td>
                          <td>{trick.totalScores[2]}</td>
                          <td>Player 4</td>
                          <td>{trick.totalScores[3]}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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