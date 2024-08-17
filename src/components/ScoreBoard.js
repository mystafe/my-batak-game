import React from 'react';

function ScoreBoard({ scores = [], playerNames = [] }) {
  return (
    <div className="scoreboard">
      <h3>Scores</h3>
      <ul>
        {playerNames.map((name, index) => (
          <li key={index}>
            {name}: {scores[index] || 0} points
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScoreBoard;