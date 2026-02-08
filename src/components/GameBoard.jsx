// src/components/GameBoard.jsx
export default function GameBoard({ board, difficulty, flipCard, isFaceUp }) {
  return (
    <div className={`game-board cols-${difficulty}`}>
      {board.map((emoji, index) => (
        <div
          key={index}
          className={`card ${isFaceUp(index) ? 'flipped' : ''}`}
          onClick={() => flipCard(index)}
        >
          <div className="card-inner">
            <div className="card-back">
              <span className="question-mark">❓</span>
            </div>
            <div className="card-front">
              <span className="emoji">{emoji}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}