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
  // const leadSuit = trick[0].card.suit;
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

// src/utils/gameLogic.js dosyasına ekleyin
export function calculateScores(bids, tricksWon) {
  return bids.map((bid, index) => {
    if (tricksWon[index] === bid) {
      return bid * 10; // Eğer teklif edilen el sayısı karşılandıysa tam puan
    } else {
      return -Math.abs(bid - tricksWon[index]) * 10; // Karşılanmadıysa negatif puan
    }
  });
}

export const isValidPlay = (card, gameState) => {
  const { currentTrick, players, currentPlayer, trumpSuit, hasTrumpBeenPlayed } = gameState;

  if (!currentTrick || !players || currentPlayer === undefined || !trumpSuit) {
    console.error("Game state is incomplete or undefined during validation.");
    return { valid: true };
  }

  const playerHand = players[currentPlayer];

  // Eğer turdaki ilk kart oynanıyorsa (currentTrick boşsa)
  if (currentTrick.length === 0) {
    // Eğer oyuncunun elinde başka suitlerden kart varsa, ilk olarak koz oynayamaz
    if (card.suit === trumpSuit && !hasTrumpBeenPlayed) {
      const nonTrumpCards = playerHand.filter(c => c.suit !== trumpSuit);
      if (nonTrumpCards.length > 0) {
        return { valid: false, message: "You cannot lead with a trump card if you have non-trump cards." };
      }
    }
    return { valid: true };
  }

  const firstTrickCard = currentTrick[0].card;
  const currentSuit = firstTrickCard.suit;
  const sameSuitCards = playerHand.filter(c => c.suit === currentSuit);
  const hasTrumpSuit = playerHand.some(c => c.suit === trumpSuit);

  // 1. Eğer oyuncunun elinde masadaki suitten kart varsa, bu suitten bir kart oynamalı.
  if (sameSuitCards.length > 0) {
    if (card.suit !== currentSuit) {
      return { valid: false, message: `You must play a ${currentSuit} card if you have one.` };
    }

    const higherCards = sameSuitCards.filter(c => values.indexOf(c.value) > values.indexOf(firstTrickCard.value));

    // Eğer elindeki kartlar masadaki kartları geçemiyorsa herhangi bir kart oynayabilir.
    if (higherCards.length > 0 && values.indexOf(card.value) <= values.indexOf(firstTrickCard.value)) {
      return { valid: false, message: 'You must play a higher card of the same suit if you have one!' };
    } else {
      return { valid: true };
    }
  }

  // 2. Eğer oyuncunun elinde aynı suitten kart yoksa ve koz atılmamışsa, koz atması zorunlu.
  if (sameSuitCards.length === 0) {
    if (hasTrumpSuit && card.suit !== trumpSuit) {
      return { valid: false, message: `You must play a trump (${trumpSuit}) if possible!` };
    }
  }

  return { valid: true };
};