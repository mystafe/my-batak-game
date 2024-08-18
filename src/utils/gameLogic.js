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

export const isValidPlay = (card, currentTrick, playerHand, trumpSuit) => {
  const leadSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null;
  const hasLeadSuit = playerHand.some(c => c.suit === leadSuit);
  const hasTrump = playerHand.some(c => c.suit === trumpSuit);

  // Kural 1: İlk oyuncu koz düşmeden koz atamaz.
  if (currentTrick.length === 0 && card.suit === trumpSuit && !playerHand.every(c => c.suit === trumpSuit)) {
    alert("You cannot play a trump card until trump has been broken, unless you only have trump cards.");
    return false;
  }

  // Eğer henüz el başlatılmadıysa, diğer kurallar geçerli değil.
  if (!leadSuit) {
    return true;
  }

  // Kural 2: Diğer oyuncular belirli bir sıralamayla kart oynamalı.
  if (leadSuit && card.suit !== leadSuit) {
    if (hasLeadSuit) {
      alert(`You must follow the suit and play a ${leadSuit} card.`);
      return false;
    } else if (card.suit !== trumpSuit && hasTrump) {
      alert(`You must play a trump (${trumpSuit}) card.`);
      return false;
    }
  }

  // Kural 3: Eğer mümkünse, masadaki kağıtlardan daha büyük bir kağıt oynanmalı.
  const highestCard = currentTrick.reduce((highest, { card }) => {
    return card.suit === leadSuit && values.indexOf(card.value) > values.indexOf(highest.value) ? card : highest;
  }, currentTrick[0].card);

  // Burada, oyuncunun daha yüksek bir kartı olup olmadığını kontrol ediyoruz.
  const hasHigherCard = playerHand.some(c => c.suit === leadSuit && values.indexOf(c.value) > values.indexOf(highestCard.value));

  if (card.suit === leadSuit && values.indexOf(card.value) < values.indexOf(highestCard.value) && hasHigherCard) {
    alert("You must play a higher card if possible.");
    return false;
  }

  return true;
};