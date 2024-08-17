// utils/gameLogic.js

export const suitOrder = ['hearts', 'diamonds', 'clubs', 'spades'];
export const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const createDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck = [];

  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ suit, value });
    });
  });

  return deck;
};

export const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const dealCards = (deck) => {
  const players = [[], [], [], []];
  deck.forEach((card, index) => {
    players[index % 4].push(card);
  });
  return players;
};

export const sortHand = (hand) => {
  return hand.sort((a, b) => {
    // First, compare by suit
    const suitComparison = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitComparison !== 0) {
      return suitComparison;
    }
    // If suits are the same, compare by value
    return values.indexOf(a.value) - values.indexOf(b.value);
  });
};

export const playCard = (card, gameState, setGameState, determineTrickWinner, values) => {
  const { currentPlayer, currentTrick, players, scores, playerNames } = gameState;
  const leadSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null;
  const playerHand = players[currentPlayer];

  // Check if the player has a card of the lead suit
  const hasLeadSuit = playerHand.some(c => c.suit === leadSuit);

  // If a player has a card of the lead suit, they must play it
  if (leadSuit && hasLeadSuit && card.suit !== leadSuit) {
    setGameState({
      ...gameState,
      notification: `${playerNames[currentPlayer]}, you must follow suit and play a ${leadSuit} card!`,
    });
    return;
  }

  // Determine the highest card played in the current trick so far
  let highestCard = currentTrick.length > 0 ? currentTrick[0].card : null;
  currentTrick.forEach(({ card: playedCard }) => {
    if (
      (playedCard.suit === highestCard.suit && values.indexOf(playedCard.value) < values.indexOf(highestCard.value)) ||
      (playedCard.suit === 'spades' && highestCard.suit !== 'spades')
    ) {
      highestCard = playedCard;
    }
  });

  // Ensure the player is playing a better card if possible
  if (leadSuit && card.suit === leadSuit) {
    const betterCards = playerHand.filter(c => c.suit === leadSuit && values.indexOf(c.value) < values.indexOf(highestCard.value));
    if (betterCards.length > 0 && values.indexOf(card.value) >= values.indexOf(highestCard.value)) {
      setGameState({
        ...gameState,
        notification: `${playerNames[currentPlayer]}, you must play a better card if possible!`,
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
      notification: `${playerNames[trickWinner]} wins the trick!`, // Notify the winner
    });
  } else {
    setGameState({
      ...gameState,
      currentTrick: newTrick,
      players: newPlayers,
      currentPlayer: (currentPlayer + 1) % 4, // Next player's turn
      notification: `${playerNames[(currentPlayer + 1) % 4]}'s turn to play a card.`,
    });
  }
};