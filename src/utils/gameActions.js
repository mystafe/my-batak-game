import { createDeck, shuffleDeck, dealCards, sortHand } from './gameLogic';
import { determineTrickWinner } from './gameLogic';

export const startGame = (setGameState) => {
  let deck = createDeck();
  deck = shuffleDeck(deck);
  const players = dealCards(deck).map(hand => sortHand(hand));

  setGameState((prevState) => ({
    ...prevState,
    deck,
    players,
    currentTrick: [],
    tricksWon: [0, 0, 0, 0],
    scores: [0, 0, 0, 0],
    currentPhase: 'bidding',
    notification: 'Cards dealt. Place your bids!',
    trumpSuit: null,
    bidOrder: shuffleDeck([0, 1, 2, 3]), // Ensure bid order is randomized
    roundCount: 0,
    playerNames: prevState.playerNames || ['Mustafa', 'Player 2', 'Player 3', 'Player 4'], // `playerNames`i koru
  }));
};


export const handleBid = (index, bid, gameState, setGameState) => {
  const newBids = [...gameState.bids];
  newBids[index] = bid;

  const nextPlayerIndex = gameState.bidOrder.indexOf(index) + 1;
  const nextPlayer = nextPlayerIndex < 4 ? gameState.bidOrder[nextPlayerIndex] : null;

  if (nextPlayer === null) {
    handleBidComplete(gameState, setGameState);
  } else {
    setGameState((prevState) => ({
      ...prevState,
      bids: newBids,
      currentPlayer: nextPlayer,
      notification: `${prevState.playerNames[nextPlayer]}, it's your turn to bid!`,
    }));
  }
};

export const handleBidComplete = (gameState, setGameState) => {
  const highestBid = Math.max(...gameState.bids.filter(bid => bid !== 'pass' && bid !== null));
  const declarer = gameState.bids.indexOf(highestBid);

  setGameState((prevState) => ({
    ...prevState,
    declarer, // Set the declarer in the game state
    currentPhase: 'chooseTrump',
    currentPlayer: declarer, // Set the current player to the declarer
    notification: `${prevState.playerNames[declarer]} wins the bid with ${highestBid}! Choose the trump suit.`,
  }));
};

export const handleTrumpSelection = (suit, gameState, setGameState) => {
  setGameState((prevState) => ({
    ...prevState,
    trumpSuit: suit,
    currentPhase: 'playing',
    currentPlayer: prevState.declarer,
    notification: `${prevState.playerNames[prevState.declarer]} selected ${suit} as the trump suit. Let the game begin!`,
  }));
};

export const handleEndTrick = (gameState, setGameState) => {
  const { currentTrick, playerNames, tricksWon } = gameState;
  const trickWinner = determineTrickWinner(currentTrick, gameState.trumpSuit);

  // Elin kazananını artır ve bildirim gönder
  const newTricksWon = [...tricksWon];
  newTricksWon[trickWinner] += 1;

  const trickCount = gameState.trickHistory.length + 1;

  // Trick history güncellemesi - Yeni trick'i en üste eklemek için ters sırayla ekle
  const updatedTrickHistory = [
    {
      trickNumber: trickCount,
      plays: currentTrick.map((t) => ({
        playerName: playerNames[t.player],
        card: t.card,
      })),
      winner: playerNames[trickWinner],
      totalScores: newTricksWon
    },
    ...gameState.trickHistory, // Önceki trick'ler
  ];

  setGameState((prevState) => ({
    ...prevState,
    currentTrick: [],
    currentPlayer: trickWinner,
    tricksWon: newTricksWon,
    trickHistory: updatedTrickHistory,
    notification: `Trick completed, winner: ${playerNames[trickWinner]}.`,
  }));

  // Eğer 13 el tamamlandıysa, round'u sonlandır
  if (newTricksWon.reduce((acc, val) => acc + val, 0) === 13) {
    handleEndRound(gameState, setGameState);
  }
};

export const handleEndRound = (gameState, setGameState) => {
  const { declarer, bids, tricksWon, scores } = gameState;
  const newScores = [...scores];

  // Calculate points for the declarer
  if (tricksWon[declarer] < bids[declarer]) {
    // Declarer did not meet their bid, lose points
    newScores[declarer] -= bids[declarer] * 10;
  } else {
    // Declarer met or exceeded their bid, gain points
    newScores[declarer] += tricksWon[declarer] * 10;
  }

  // Calculate points for other players based on the number of tricks won
  for (let i = 0; i < 4; i++) {
    if (i !== declarer) {
      newScores[i] += tricksWon[i] * 10;
    }
  }

  setGameState((prevState) => ({
    ...prevState,
    scores: newScores,
    currentTrick: [],
    tricksWon: [0, 0, 0, 0],
    notification: `Round complete. Scores updated.`,
    currentPhase: 'end',  // Oyun bitiş ekranı için currentPhase'i 'end' olarak güncelle
  }));
};
export const handleEndGame = (gameState, setGameState) => {
  const { scores } = gameState;
  console.log('Final Scores:', {
    'Mustafa': scores[0],
    'Player 2': scores[1],
    'Player 3': scores[2],
    'Player 4': scores[3]
  });

  setGameState({
    ...gameState,
    currentPhase: 'end',
    notification: `Game over. Final scores: ${scores.join(', ')}`,
  });
};

export const handleNewRound = (gameState, setGameState) => {
  let deck = createDeck();
  deck = shuffleDeck(deck);
  const players = dealCards(deck).map(hand => sortHand(hand));

  setGameState((prevState) => ({
    ...prevState,
    deck,
    players,
    currentTrick: [],
    tricksWon: [0, 0, 0, 0],
    bids: [null, null, null, null],
    currentPhase: 'bidding',
    notification: 'New round started. Place your bids!',
    trumpSuit: null,
    bidOrder: shuffleDeck([0, 1, 2, 3]),
    roundCount: 0,
  }));
};

export const handleNewGame = (setGameState) => {
  startGame(setGameState);
};