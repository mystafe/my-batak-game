import React from 'react';

const TrickHistory = ({ trickHistory }) => {
  return (
    <div className="trick-history">
      <h4>Trick History</h4>
      <ul>
        {trickHistory.map((trick, index) => (
          <li key={index}>
            {trick.plays.map((play, idx) => (
              <div key={idx}>
                {`${play.playerName} ${getSuitSymbol(play.card.suit)} ${play.card.value}`}
              </div>
            ))}
            <div><strong>Trick {trick.trickNumber} winner: <u>{trick.winner}</u></strong></div>
            <div className="trick-summary">
              <table>
                <tbody>
                  <tr>
                    <td>Mustafa</td>
                    <td>{trick.totalScores[0]}</td>
                    <td>Player 2</td>
                    <td>{trick.totalScores[1]}</td>
                  </tr>
                  <tr>
                    <td>Player 3</td>
                    <td>{trick.totalScores[2]}</td>
                    <td>Player 4</td>
                    <td>{trick.totalScores[3]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p> </p>
            <div><strong>Current Score:</strong></div>
            <div className="trick-summary">
              <table>
                <tbody>
                  <tr>
                    <td>Mustafa</td>
                    <td>{trick.totalScores[0]}</td>
                    <td>Player 2</td>
                    <td>{trick.totalScores[1]}</td>
                  </tr>
                  <tr>
                    <td>Player 3</td>
                    <td>{trick.totalScores[2]}</td>
                    <td>Player 4</td>
                    <td>{trick.totalScores[3]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>------------------ </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const getSuitSymbol = (suit) => {
  switch (suit) {
    case 'hearts':
      return '♥️';
    case 'diamonds':
      return '♦️';
    case 'clubs':
      return '♣️';
    case 'spades':
      return '♠️';
    default:
      return '';
  }
};

export default TrickHistory;