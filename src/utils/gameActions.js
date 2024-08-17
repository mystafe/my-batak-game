import { values, createDeck, shuffleDeck, dealCards, sortHand, determineTrickWinner } from './gameLogic';
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
    bidOrder: [],
    roundCount: 0,
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
    players: prevState.players.length === 4 ? prevState.players : [[], [], [], []],
  }));
};

export const handleEndRound = (gameState, setGameState) => {
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
    setGameState((prevState) => ({
      ...prevState,
      scores: newScores,
      currentPhase: 'end',
      notification: `Game over. Final scores: ${newScores.join(', ')}`,
    }));
  } else {
    setGameState((prevState) => ({
      ...prevState,
      scores: newScores,
      roundCount: newRoundCount,
      currentPhase: 'bidding',
      notification: `Round ${newRoundCount} complete. Next round begins.`,
    }));
  }
};

export const handlePlayCard = (card, gameState, setGameState) => {
  console.log(`Player ${gameState.currentPlayer + 1} played:`, card);

  const { currentPlayer, currentTrick, players } = gameState;
  const currentSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : card.suit;
  const playerHand = players[currentPlayer];

  const sameSuitCards = playerHand.filter(c => c.suit === currentSuit);

  if (sameSuitCards.length > 0) {
    const highestSameSuitCard = sameSuitCards.reduce((max, current) => {
      return values.indexOf(current.value) > values.indexOf(max.value) ? current : max;
    });

    if (values.indexOf(card.value) < values.indexOf(highestSameSuitCard.value)) {
      alert(`${gameState.playerNames[currentPlayer]}, you must play a better card if possible!`);
      return;
    }
  }

  const newTrick = [...currentTrick, { player: currentPlayer, card }];
  const newPlayers = players.map((hand, index) =>
    index === currentPlayer ? hand.filter(c => c !== card) : hand
  );

  if (newTrick.length === 4) {
    const trickWinner = determineTrickWinner(newTrick, gameState.trumpSuit);
    setGameState((prevState) => ({
      ...prevState,
      currentTrick: [],
      players: newPlayers,
      currentPlayer: trickWinner,
    }));
  } else {
    setGameState((prevState) => ({
      ...prevState,
      currentTrick: newTrick,
      players: newPlayers,
      currentPlayer: (currentPlayer + 1) % 4,
    }));
  }
};