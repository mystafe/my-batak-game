import React from 'react';

function Trick({ trick = [] }) {  // Default to an empty array if trick is undefined
  return (
    <div className="trick">
      <h2>Current Trick</h2>
      {trick.length === 0 ? (
        <p>No cards played yet.</p>
      ) : (
        trick.map((item, index) => (
          <div key={index}>
            Player {item.player + 1}: {item.card.value} of {item.card.suit}
          </div>
        ))
      )}
    </div>
  );
}

export default Trick;