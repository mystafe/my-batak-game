import React, { useState } from 'react';

function Bidding({ onBidComplete }) {
  const [bids, setBids] = useState([null, null, null, null]);
  const [currentPlayer, setCurrentPlayer] = useState(0);

  const handleBid = (bidValue) => {
    const newBids = [...bids];
    newBids[currentPlayer] = bidValue;

    if (currentPlayer === 3) {
      onBidComplete(newBids);
    } else {
      setCurrentPlayer(currentPlayer + 1);
    }

    setBids(newBids);
  };

  return (
    <div className="bidding">
      <p>Player {currentPlayer + 1}, place your bid:</p>
      <button onClick={() => handleBid(1)}>1</button>
      <button onClick={() => handleBid(2)}>2</button>
      <button onClick={() => handleBid(3)}>3</button>
      {/* Add more bid buttons as needed */}
    </div>
  );
}

export default Bidding;