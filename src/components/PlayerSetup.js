import React from 'react';

function PlayerSetup({ playerNames, handleNameChange, startGame }) {
  return (
    <div className="player-setup">
      {playerNames.map((name, index) => (
        <div key={index}>
          <label>Player {index + 1} Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(index, e.target.value)}
          />
        </div>
      ))}
      <button className="start-game" onClick={startGame}>Start Game</button>
    </div>
  );
}

export default PlayerSetup;