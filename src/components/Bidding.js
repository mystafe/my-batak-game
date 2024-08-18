import React from 'react';
import { getCardImage } from '../utils/gameLogic';

function Bidding({ playerNames, currentPlayer, handleBid, gameState }) {
  const { players = [], bids = [] } = gameState || {};

  if (!players[currentPlayer] || !playerNames || !playerNames[currentPlayer]) {
    return <div>Error: Player data is not available. Please restart the game.</div>;
  }

  // Find the highest bid so far
  const highestBid = Math.max(...bids.filter(bid => bid !== 'pass' && bid !== null), 0);

  return (
    <div className="bidding-container">
      <h2>{playerNames[currentPlayer]}: Place your bid</h2>
      <div className="bidding-cards">
        {players[currentPlayer].map((card, index) => (
          <img
            key={index}
            src={getCardImage(card)}
            alt={`${card.value} of ${card.suit}`}
            className="bidding-card"
          />
        ))}
      </div>
      <div className="bidding-buttons">
        <button onClick={() => handleBid(currentPlayer, 'pass')} className="bid-button">
          Pass
        </button>
        {[...Array(10)].map((_, index) => {
          const bidValue = index + 1;
          const isDisabled = bidValue <= highestBid;
          return (
            <button
              key={bidValue}
              onClick={() => handleBid(currentPlayer, bidValue)}
              className="bid-button"
              disabled={isDisabled}
              style={{
                opacity: isDisabled ? 0.5 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
              }}
            >
              Bid {bidValue}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Bidding;