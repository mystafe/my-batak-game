import { handleEndTrick } from './gameActions';

export const suitOrder = ['hearts', 'diamonds', 'clubs', 'spades'];
export const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const handlePlayCard = (card, gameState, setGameState) => {
  const currentPlayerIndex = gameState.currentPlayer;

  // Check if the player leading the trick has non-trump cards available
  if (gameState.currentTrick.length === 0 && card.suit === gameState.trumpSuit) {
    const playerHand = gameState.players[currentPlayerIndex];
    const hasOtherSuits = playerHand.some(c => c.suit !== gameState.trumpSuit);

    if (hasOtherSuits) {
      alert("You cannot play a trump card first if you have other suits available.");
      return;
    }
  }

  if (!isValidPlay(card, gameState).valid) {
    alert(isValidPlay(card, gameState).message);
    return;
  }

  const newGameState = updateGameStateAfterPlay(card, gameState);
  const nextPlayerIndex = newGameState.currentPlayer % 4;
  const nextPlayableCards = calculatePlayableCards(newGameState, nextPlayerIndex);

  // Update the game state
  setGameState((prevState) => ({
    ...prevState,
    ...newGameState,
    playableCards: nextPlayableCards,
  }));

  // If 4 cards have been played, handle the end of the trick
  if (newGameState.currentTrick.length === 4) {
    handleEndTrick(newGameState, setGameState);
  }
};
const updateGameStateAfterPlay = (card, gameState) => {
  const newTrick = [...gameState.currentTrick, { player: gameState.currentPlayer, card }];
  const newPlayers = gameState.players.map((hand, index) =>
    index === gameState.currentPlayer ? hand.filter(c => c !== card) : hand
  );

  const newHighestCardValue = updateHighestCardValue(card, gameState);
  const hasTrumpBeenPlayedUpdate = card.suit === gameState.trumpSuit || gameState.hasTrumpBeenPlayed;

  return {
    ...gameState,
    currentTrick: newTrick,
    players: newPlayers,
    currentPlayer: (gameState.currentPlayer + 1) % 4,
    hasTrumpBeenPlayed: hasTrumpBeenPlayedUpdate,
    highestCardValue: newHighestCardValue,
    leadSuit: gameState.leadSuit || card.suit,
  };
};

const updateHighestCardValue = (card, gameState) => {
  if (card.suit === gameState.leadSuit && values.indexOf(card.value) > gameState.highestCardValue) {
    return values.indexOf(card.value);
  }
  return gameState.highestCardValue;
};

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

export const calculatePlayableCards = (gameState, nextPlayerIndex) => {
  const { players, trumpSuit, leadSuit, highestCardValue, hasTrumpBeenPlayed } = gameState;

  if (!players || nextPlayerIndex === undefined) {
    return [];
  }

  const playerHand = players[nextPlayerIndex];
  if (!playerHand) {
    console.error("Player's hand is undefined");
    return [];
  }

  // 1. Lead suit (ilk oynanan kartın türü) var mı kontrol et
  const sameSuitCards = playerHand.filter(card => card.suit === leadSuit);

  if (sameSuitCards.length > 0) {
    // 1.1. Lead suit varsa ve masadaki en yüksek kartı geçebilecek kart varsa, sadece bu kartlar oynanabilir
    const cardsThatCanBeatHighest = sameSuitCards.filter(card =>
      values.indexOf(card.value) > highestCardValue
    );

    if (cardsThatCanBeatHighest.length > 0) {
      return cardsThatCanBeatHighest;
    }

    // 1.2. Lead suit varsa ama masadaki en yüksek kartı geçemiyorsa, tüm lead suit kartları oynanabilir
    return sameSuitCards;
  }

  // 2. Eğer lead suit yoksa, koz (trump) oynama zorunluluğu
  const trumpCards = playerHand.filter(card => card.suit === trumpSuit);

  if (trumpCards.length > 0) {
    // 2.1. Koz varsa ve masadaki kartı geçebilecekse, sadece bu kartlar oynanabilir
    const trumpCardsThatCanBeatHighest = trumpCards.filter(card =>
      card.suit === trumpSuit && values.indexOf(card.value) > highestCardValue
    );

    if (trumpCardsThatCanBeatHighest.length > 0) {
      return trumpCardsThatCanBeatHighest;
    }

    // 2.2. Koz varsa ama geçemiyorsa, tüm koz kartları oynanabilir
    return trumpCards;
  }

  // 3. Eğer lead suit ve koz yoksa, herhangi bir kart oynanabilir
  return playerHand;
};

export const isValidPlay = (card, gameState) => {
  const { playableCards } = gameState;

  // Eğer playableCards boş değilse, seçilen kart playableCards içinde olmalıdır
  if (playableCards.length > 0) {
    const isPlayable = playableCards.some(
      (playableCard) => playableCard.suit === card.suit && playableCard.value === card.value
    );

    if (!isPlayable) {
      return { valid: false, message: 'You must play a valid card from the available playable cards!' };
    }
  }

  // Eğer playableCards listesi boşsa (örn: ilk tur), herhangi bir kart oynanabilir

  return { valid: true };
};