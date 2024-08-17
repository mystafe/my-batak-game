import React from 'react';
import { getCardImage } from '../utils/gameLogic';

function PlayerHand({ cards, playCard }) {
  if (!cards || cards.length === 0) {
    return <div>No cards available</div>;
  }

  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <img
          key={index}
          src={getCardImage(card)}
          alt={`${card.value} of ${card.suit}`}
          className="bidding-card"
          onClick={() => playCard(card)}
        />
      ))}
    </div>
  );
}

export default PlayerHand;