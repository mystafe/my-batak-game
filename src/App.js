import React from 'react';
import GameBoard from './components/GameBoard';
import './App.css';

function App() {
  return (
    <div className="App">
      <GameBoard />
      <h1 className="game-title">Batak: The Card Game - Developed by Mustafa Evleksiz</h1>
    </div>
  );
}

export default App;