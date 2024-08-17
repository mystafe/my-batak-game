export const values = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

const suits = ["hearts", "diamonds", "clubs", "spades"]; // Define suits

export function createDeck() {
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

export function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function dealCards(deck) {
  const players = [[], [], [], []];
  for (let i = 0; i < 13; i++) {
    players.forEach(player => {
      player.push(deck.pop());
    });
  }

  // Sort each player's hand
  players.forEach((player, index) => {
    players[index] = sortHand(player);
  });

  return players;
}

export function sortHand(hand) {
  const suitOrder = {
    spades: 1,
    hearts: 2,
    diamonds: 3,
    clubs: 4
  };

  const valueOrder = values.reduce((acc, value, index) => {
    acc[value] = index;
    return acc;
  }, {});

  return hand.sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    } else {
      return valueOrder[a.value] - valueOrder[b.value];
    }
  });
}

// Define and export the calculateScores function
export function calculateScores(bids, tricksWon) {
  return bids.map((bid, index) => {
    if (tricksWon[index] === bid) {
      return bid * 10; // Full points if bid is matched exactly
    } else {
      return -Math.abs(bid - tricksWon[index]) * 10; // Negative points if bid is not met
    }
  });
}