import { handleEndTrick } from './gameActions'; // If handleEndTrick is imported from another file

export const handlePlayCard = (card, gameState, setGameState) => {
  const { currentPlayer, currentTrick, players, trumpSuit, leadSuit, highestCardValue } = gameState;

  // Check if the card is valid
  const isValid = isValidPlay(card, gameState);
  if (!isValid.valid) {
    alert(isValid.message);
    return;
  }

  const newTrick = [...currentTrick, { player: currentPlayer, card }];
  const newPlayers = players.map((hand, index) =>
    index === currentPlayer ? hand.filter(c => c !== card) : hand
  );

  let newHighestCardValue = highestCardValue;
  if (card.suit === leadSuit && values.indexOf(card.value) > highestCardValue) {
    newHighestCardValue = values.indexOf(card.value);
  }

  // Update hasTrumpBeenPlayed if a trump card was played
  const hasTrumpBeenPlayedUpdate = card.suit === trumpSuit || gameState.hasTrumpBeenPlayed;

  // Update the game state
  const newGameState = {
    ...gameState,
    currentTrick: newTrick,
    players: newPlayers,
    currentPlayer: (currentPlayer + 1) % 4,
    hasTrumpBeenPlayed: hasTrumpBeenPlayedUpdate,
    highestCardValue: newHighestCardValue,
    leadSuit: leadSuit || card.suit,
  };
  const playableCards = calculatePlayableCards(newGameState);

  // Log the playable cards for the next player
  console.log("Playable Cards for the next player:", playableCards);

  // Update the global state
  setGameState((prevState) => ({
    ...prevState,
    ...newGameState,
    playableCards,  // Update playable cards
  }));

  // If 4 cards have been played, end the trick
  if (newTrick.length === 4) {
    handleEndTrick(newGameState, setGameState);
  }
};

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
    const suitComparison = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitComparison !== 0) {
      return suitComparison;
    }
    return values.indexOf(a.value) - values.indexOf(b.value);
  });
};

export const determineTrickWinner = (trick, trumpSuit) => {
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

export const getCardImage = (card) => {
  return `cards/${card.value}_of_${card.suit}.png`;
};

export function calculateScores(bids, tricksWon) {
  return bids.map((bid, index) => {
    if (tricksWon[index] === bid) {
      return bid * 10; // Full points if the bid is met
    } else {
      return -Math.abs(bid - tricksWon[index]) * 10; // Negative points if not met
    }
  });
}

export const calculatePlayableCards = (gameState) => {
  const { currentPlayer, players, trumpSuit, leadSuit } = gameState;

  if (!players || currentPlayer === undefined) {
    console.error("Players or currentPlayer is undefined");
    return [];
  }

  const playerHand = players[currentPlayer];
  if (!playerHand) {
    console.error("Player's hand is undefined");
    return [];
  }

  const sameSuitCards = playerHand.filter(card => card.suit === leadSuit);
  const hasTrumpSuit = playerHand.some(card => card.suit === trumpSuit);

  if (sameSuitCards.length > 0) {
    return sameSuitCards;
  } else if (hasTrumpSuit) {
    return playerHand.filter(card => card.suit === trumpSuit);
  } else {
    return playerHand;
  }
};

export const isValidPlay = (card, gameState) => {
  const { playableCards } = gameState;

  // If playableCards is not empty, the selected card must be in the playableCards
  if (playableCards.length > 0) {
    const isPlayable = playableCards.some(
      (playableCard) => playableCard.suit === card.suit && playableCard.value === card.value
    );

    if (!isPlayable) {
      return { valid: false, message: 'You must play a valid card from the available playable cards!' };
    }
  }

  // If the playableCards list is empty (e.g., first turn), any card can be played
  return { valid: true };
};