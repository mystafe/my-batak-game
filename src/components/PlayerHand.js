import React from 'react';
import Card from './Card';

function PlayerHand({ hand }) {
  return (
    <div className="player-hand">
      {hand.map((card, index) => (
        <Card key={index} card={card} />
      ))}
    </div>
  );
}

export default PlayerHand;