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