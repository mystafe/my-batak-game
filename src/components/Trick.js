import React from 'react';
import { getCardImage } from '../utils/gameLogic';
function Trick({ trick, playerNames }) {
  return (
    <div className="trick-cards">
      {trick.map(({ player, card }, index) => (
        <div key={index} className="trick-card">
          <img
            src={getCardImage(card)}
            alt={`${card.value} of ${card.suit}`}
            className="bidding-card" /* Applying the same class to ensure uniform style */
          />
          <p>{playerNames[player]}</p>
        </div>
      ))}
    </div>
  );
}

export default Trick;