import React from 'react';

function ScoreBoard({ scores, playerNames }) {
  return (
    <div className="scoreboard">
      {playerNames.map((name, index) => (
        <div key={index}>
          <p>{name}: {scores[index]}</p>
        </div>
      ))}
    </div>
  );
}

export default ScoreBoard;