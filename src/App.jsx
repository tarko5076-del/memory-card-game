import { useState, useEffect, useRef } from 'react';
import './App.css';

import Header from './components/Header';
import GameBoard from './components/GameBoard';
import Win from './components/Win';

// ─── Themes ───────────────────────────────────────────────────────────────
const themes = {
  animals: {
    name: 'Animals',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
      '🦁','🐮','🐷','🐸','🐔','🐧','🐦','🦄','🐳','🐙',
      '🦋','🐌','🦖','🐢','🐍','🦎','🦅','🦉','🦜','🦚'
    ]
  },
  space: {
    name: 'Space',
    emojis: [
      '🌙','⭐','🌟','☄️','🪐','🚀','🛰️','🌌','👽','🛸',
      '🌠','🌕','🌍','🌑','🌒','🌓','🌔','🌖','🌗','🌘',
      '🪐','🌞','🪐','🪐','🌎','🪐','🪐','🪐','🪐','🪐'
    ]
  },
  fruits: {
    name: 'Fruits',
    emojis: [
      '🍎','🍏','🍊','🍋','🍌','🍉','🍇','🍓','🍒','🍑',
      '🥭','🍍','🥥','🥝','🍅','🥑','🍆','🥔','🥕','🌽',
      '🫑','🥒','🫐','🍈','🍐','🍊','🍍','🍓','🍒','🍑'
    ]
  },
  faces: {
    name: 'Faces',
    emojis: [
      '😀','😎','🥳','🤓','😺','🤖','👻','🎃','💀','👾',
      '🧠','🫀','👀','👄','🧑‍🚀','🧙','🧚','🧞','🧜','🧝'
    ]
  }
};

function App() {
  const [difficulty, setDifficulty] = useState('medium');
  const [themeKey, setThemeKey] = useState('animals');

  const [board, setBoard] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('memoryHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isNewHigh, setIsNewHigh] = useState(false);

  const audioCtxRef = useRef(null);

  // ─── Sound ────────────────────────────────────────────────────────────────
  const playSound = (frequency, duration, type = 'sine') => {
    let ctx = audioCtxRef.current;
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
    }
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.type = type;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playMatchSound    = () => playSound(800, 0.3, 'sine');
  const playMismatchSound = () => playSound(300, 0.5, 'square');

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPairCount = (diff) => {
    if (diff === 'easy')   return 4;   //  8 cards
    if (diff === 'medium') return 8;   // 16 cards
    return 18;                         // 36 cards – full 6×6
  };

  const shuffleCards = () => {
    const selectedTheme = themes[themeKey];
    if (!selectedTheme) return;

    const neededPairs = getPairCount(difficulty);
    let selectedEmojis = selectedTheme.emojis.slice(0, neededPairs);

    // If not enough → repeat from beginning
    while (selectedEmojis.length < neededPairs) {
      selectedEmojis.push(...selectedTheme.emojis.slice(0, neededPairs - selectedEmojis.length));
    }
    selectedEmojis = selectedEmojis.slice(0, neededPairs);

    const duplicated = [...selectedEmojis, ...selectedEmojis];
    const shuffled = duplicated.sort(() => Math.random() - 0.5);

    setBoard(shuffled);
  };

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    resetGameValues();
    shuffleCards();
  }, [difficulty, themeKey]);

  useEffect(() => {
    let timerId;
    if (gameStarted && !gameWon) {
      timerId = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [gameStarted, gameWon]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [idx1, idx2] = flippedCards;

      if (board[idx1] === board[idx2]) {
        setMatchedCards(prev => new Set([...prev, idx1, idx2]));
        setScore(prev => prev + 10);
        playMatchSound();
        setFlippedCards([]);
      } else {
        playMismatchSound();
        setScore(prev => Math.max(0, prev - 2));
        setTimeout(() => setFlippedCards([]), 900);
      }
    }
  }, [flippedCards, board]);

  useEffect(() => {
    if (matchedCards.size === board.length && board.length > 0) {
      setGameWon(true);
      if (score > highScore) {
        setIsNewHigh(true);
        setHighScore(score);
        localStorage.setItem('memoryHighScore', score.toString());
      }
    }
  }, [matchedCards, board, score, highScore]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const flipCard = (index) => {
    if (
      flippedCards.includes(index) ||
      matchedCards.has(index) ||
      flippedCards.length === 2 ||
      gameWon
    ) return;

    setFlippedCards(prev => [...prev, index]);
    if (!gameStarted) setGameStarted(true);
  };

  const isFaceUp = (index) => flippedCards.includes(index) || matchedCards.has(index);

  const changeDifficulty = (newDiff) => {
    setDifficulty(newDiff);
  };

  const changeTheme = (newTheme) => {
    setThemeKey(newTheme);
  };

  const resetGame = () => {
    resetGameValues();
    shuffleCards();
  };

  const resetGameValues = () => {
    setFlippedCards([]);
    setMatchedCards(new Set());
    setMoves(0);
    setScore(0);
    setSecondsElapsed(0);
    setGameStarted(false);
    setGameWon(false);
    setIsNewHigh(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <Header
        difficulty={difficulty}
        changeDifficulty={changeDifficulty}
        moves={moves}
        score={score}
        secondsElapsed={secondsElapsed}
        highScore={highScore}
        formatTime={formatTime}
        resetGame={resetGame}
      />

      <div className="theme-selector">
        <div className="theme-buttons">
          {Object.keys(themes).map(key => (
            <button
              key={key}
              className={`theme-btn ${themeKey === key ? 'active' : ''}`}
              onClick={() => changeTheme(key)}
            >
              {themes[key].name} <span className="theme-preview">{themes[key].emojis[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <GameBoard
        key={`${difficulty}-${themeKey}`}   // ← important: forces re-render
        board={board}
        difficulty={difficulty}
        flipCard={flipCard}
        isFaceUp={isFaceUp}
      />

      <Win
        gameWon={gameWon}
        isNewHigh={isNewHigh}
        moves={moves}
        secondsElapsed={secondsElapsed}
        score={score}
        highScore={highScore}
        formatTime={formatTime}
        resetGame={resetGame}
      />
    </div>
  );
}

export default App;