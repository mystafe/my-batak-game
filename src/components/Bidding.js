import React from 'react';
import { getCardImage } from '../utils/gameLogic';

function Bidding({ playerNames, currentPlayer, handleBid, gameState }) {
  const { players, bids } = gameState;

  // Find the highest bid so far
  const highestBid = Math.max(...bids.filter(bid => bid !== 'pass' && bid !== null));

  return (
    <div className="bidding-container">
      <h2>{playerNames[currentPlayer]}: Place your bid</h2>
      <div className="bidding-cards">
        {players[currentPlayer].map((card, index) => (
          <img key={index} src={getCardImage(card)} alt={`${card.value} of ${card.suit}`} className="bidding-card" />
        ))}
      </div>
      <div className="bidding-buttons">
        {[...Array(10)].map((_, index) => {
          const bidValue = index + 1;
          return (
            <button
              key={bidValue}
              onClick={() => handleBid(currentPlayer, bidValue)}
              className={`bid-button ${bidValue <= highestBid ? 'disabled-button' : ''}`}
              disabled={bidValue <= highestBid} // Disable if the bid value is less than or equal to the highest bid
            >
              Bid {bidValue}
            </button>
          );
        })}
        <button onClick={() => handleBid(currentPlayer, 'pass')} className="bid-button">
          Pass
        </button>
      </div>
    </div>
  );
}

export default Bidding;