// src/components/Win.jsx
export default function Win({
  gameWon,
  isNewHigh,
  moves,
  secondsElapsed,
  score,
  highScore,
  formatTime,
  resetGame,
}) {
  if (!gameWon) return null;

  return (
    <div className="win-overlay">
      <div className="win-content">
        <h2>{isNewHigh ? '🏆 New High Score! 🏆' : 'Great job! 🎉'}</h2>

        <p>
          Moves: <strong>{moves}</strong>
        </p>
        <p>
          Time: <strong>{formatTime(secondsElapsed)}</strong>
        </p>
        <p>
          Score: <strong>{score}</strong>
        </p>
        <p>
          Best: <strong>{highScore}</strong>
        </p>

        <button onClick={resetGame} className="play-again-btn">
          Play Again
        </button>
      </div>
    </div>
  );
}