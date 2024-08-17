import React, { useState } from 'react';

function Bidding({ onBidComplete, playerNames }) {
  const [bids, setBids] = useState([null, null, null, null]);

  const handleBid = (index, bid) => {
    const newBids = [...bids];
    newBids[index] = bid;
    setBids(newBids);

    if (newBids.every(bid => bid !== null)) {
      onBidComplete(newBids);
    }
  };

  return (
    <div>
      {playerNames.map((name, index) => (
        <div key={index}>
          <span>{name}'s Bid:</span>
          <select onChange={(e) => handleBid(index, parseInt(e.target.value, 10))}>
            {[...Array(11).keys()].slice(1).map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
export default Bidding;