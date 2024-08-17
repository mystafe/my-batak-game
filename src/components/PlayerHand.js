import React from 'react';

function PlayerHand({ cards, playCard }) {
  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <img
          key={index}
          src={`cards/${card.value}_of_${card.suit}.png`}
          alt={`${card.value} of ${card.suit}`}
          onClick={() => playCard(card)}
          style={{ cursor: 'pointer', width: '100px', height: 'auto' }}
        />
      ))}
    </div>
  );
}

export default PlayerHand;