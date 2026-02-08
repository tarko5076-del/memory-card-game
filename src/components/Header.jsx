// src/components/Header.jsx
export default function Header({
  difficulty,
  changeDifficulty,
  moves,
  score,
  secondsElapsed,
  highScore,
  formatTime,
  resetGame,
}) {
  return (
    <div className="header">
      <h1>🎮 Memory Card Game</h1>

      <div className="difficulty">
        <button
          className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
          onClick={() => changeDifficulty('easy')}
        >
          Easy 8
        </button>
        <button
          className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
          onClick={() => changeDifficulty('medium')}
        >
          Medium 16
        </button>
        <button
          className={`diff-btn ${difficulty === 'hard' ? 'active' : ''}`}
          onClick={() => changeDifficulty('hard')}
        >
          Hard 24
        </button>
      </div>

      <div className="stats">
        <p>
          Moves: <span>{moves}</span>
        </p>
        <p>
          Score: <span>{score}</span>
        </p>
        <p>
          Time: <span>{formatTime(secondsElapsed)}</span>
        </p>
        <p>
          High: <span>{highScore}</span>
        </p>
      </div>

      <button onClick={resetGame} className="reset-btn">
        New Game
      </button>
    </div>
  );
}