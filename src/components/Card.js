import React from 'react';

function Card({ card }) {
  return (
    <div className="card">
      <div className="card-value">{card.value}</div>
      <div className="card-suit">{card.suit}</div>
    </div>
  );
}

export default Card;