import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from "react";
import { useRef } from "react";

class Tetris {
  static X_BOARD = 10;
  static Y_BOARD = 20;
  static MAX_SPEED = 4;
  static GAME_NOT_STARTED = 0;
  static GAME_STARTED = 1;
  static GAME_OVER = 2;
  static SHAPES = [
    [[1, 1, 1, 1]],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
  ];
  board;
  piece;
  score;
  gameStatus;
  speed;
  constructor() {
    this.speed = 0;
    this.gameStatus = Tetris.GAME_NOT_STARTED;
    this.board = Array(Tetris.Y_BOARD)
      .fill(0)
      .map(() => Array(Tetris.X_BOARD).fill(0));
  }

  init() {
    console.log("Game starting...");
    this.board = Array(Tetris.Y_BOARD)
      .fill(0)
      .map(() => Array(Tetris.X_BOARD).fill(0));
    this.score = 0;
    this.gameStatus = Tetris.GAME_STARTED;
    this.speed = 0;
    this.generatePiece();
  }

  generatePiece() {
    const shape =
      Tetris.SHAPES[Math.floor(Math.random() * Tetris.SHAPES.length)];
    this.piece = {
      x: Math.floor(Math.random() * (Tetris.X_BOARD - shape[0].length + 1)),
      y: 0,
      shape,
    };
    this.placePiece({});
  }

  rotatePiece() {
    this.removePiece();
    let newShape = this.piece.shape[0].map((val, index) =>
      this.piece.shape.map((row) => row[index]).reverse()
    );
    this.piece.shape = newShape;

    while (this.piece.y + this.piece.shape.length > Tetris.Y_BOARD) {
      this.piece.y--;
    }

    while (this.piece.x + this.piece.shape[0].length > Tetris.X_BOARD) {
      this.piece.x--;
    }

    this.placePiece({});
  }

  placePiece({ stick = false, remove = false }) {
    for (let y = 0; y < this.piece.shape.length; y++) {
      for (let x = 0; x < this.piece.shape[y].length; x++) {
        const newY = this.piece.y + y;
        const newX = this.piece.x + x;
        this.board[newY][newX] =
          this.piece.shape[y][x] === 1
            ? remove
              ? 0
              : stick
              ? 2
              : this.board[newY][newX] > 0
              ? 3
              : 1
            : this.board[newY][newX];

        if (this.board[newY][newX] == 3) {
          this.gameStatus = Tetris.GAME_OVER;
        }
      }
    }

    if (stick) {
      this.clearCompleteLines();
      this.generatePiece();
    }
  }

  movePiece(dx, dy) {
    let newX = this.piece.x + dx;
    let newY = this.piece.y + dy;
    let stick = false;
    let validMove = true;
    this.removePiece();

    for (let y = 0; y < this.piece.shape.length; y++) {
      for (let x = 0; x < this.piece.shape[y].length; x++) {
        // Check we don't go outside the board and there's no collision.
        if (
          (dx != 0 &&
            (newX < 0 || newX + this.piece.shape[0].length > Tetris.X_BOARD)) ||
          (dy != 0 &&
            (newY < 0 || newY + this.piece.shape.length > Tetris.Y_BOARD)) ||
          (this.board[newY + y][newX + x] > 0 && this.piece.shape[y][x] == 1)
        ) {
          validMove = false;
        }
        // Check if we need to stick the piece.
        if (
          dy &&
          (newY + this.piece.shape.length - 1 === Tetris.Y_BOARD ||
            (this.board[newY + y][newX + x] > 0 && this.piece.shape[y][x] == 1))
        ) {
          stick = true;
        }
      }
    }
    if (validMove) {
      this.piece.x = newX;
      this.piece.y = newY;
    }
    this.placePiece({ stick });
  }

  removePiece() {
    this.placePiece({ remove: true });
  }

  clearCompleteLines() {
    let lines = 0;
    this.board = this.board.filter((line) => {
      for (let x = 0; x < Tetris.X_BOARD; x++) {
        if (line[x] !== 2) {
          return true;
        }
      }
    });
    while (this.board.length < Tetris.Y_BOARD) {
      this.board.unshift(Array(Tetris.X_BOARD).fill(0));
      lines++;
    }
    this.score = this.score + lines * lines * 100;
    this.speed =
      Math.floor(this.score / 1000) > Tetris.MAX_SPEED
        ? 4
        : Math.floor(this.score / 1000);
  }
}
const tetris = new Tetris();

export default function Home() {
  const [_, setState] = useState({});
  const [counter, setCounter] = useState(Tetris.MAX_SPEED);
  const audioRef = useRef();
  const container_style = {
    backgroundColor:
      tetris.speed == 0
        ? "white"
        : tetris.speed == 1
        ? "antiquewhite"
        : tetris.speed == 2
        ? "navajowhite"
        : tetris.speed == 3
        ? "peachpuff"
        : "mediumpurple",
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      if (e.key == "Enter") {
        if (audioRef.current && !audioRef.current.muted) {
          audioRef.current.load();
        }
        tetris.init();
      }

      if (tetris.gameStatus === Tetris.GAME_OVER) {
        return;
      }

      if ((e.key == "M" || e.key == "m") && audioRef.current) {
        if (audioRef.current.muted) {
          audioRef.current.muted = false;
          audioRef.current.play();
        } else {
          audioRef.current.muted = true;
        }
      }
      if (e.key == "ArrowDown") {
        tetris.movePiece(0, 1);
      }

      if (e.key == "ArrowLeft") {
        tetris.movePiece(-1, 0);
      }

      if (e.key == "ArrowRight") {
        tetris.movePiece(1, 0);
      }

      if (e.key == "ArrowUp") {
        tetris.rotatePiece();
      }
      setState({});
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    const id = setInterval(() => {
      switch (tetris.gameStatus) {
        case Tetris.GAME_STARTED:
          if (counter <= tetris.speed) {
            // Reset counter.
            setCounter(Tetris.MAX_SPEED);
            tetris.movePiece(0, 1);
            setState({});
          } else {
            setCounter(counter - 1);
          }
          break;
        case Tetris.GAME_NOT_STARTED:
          tetris.init();
          setState({});
          break;
        case Tetris.GAME_OVER:
          if (audioRef.current) {
            audioRef.current.pause();
          }
        default:
        // Do nothing.
      }
    }, 100);

    return () => clearInterval(id);
  }, [counter]);

  return (
    <div className={styles.container} style={container_style}>
      <Head>
        <title>Tetris example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <audio ref={audioRef} autoPlay muted loop={true}>
        <source src="/POL-puzzle-kid-short.wav" type="audio/wav"></source>
      </audio>
      <main
        className={tetris.gameStatus === Tetris.GAME_OVER ? "game-over" : ""}
      >
        <div className="game-over-msg">
          {tetris.gameStatus === Tetris.GAME_OVER ? "GAME OVER" : null}
        </div>
        <div className="score-msg">Score: {tetris.score}</div>
        {tetris.board.map((row, index) => {
          return (
            <div key={index}>
              {row.map((cell, j) => {
                const style = {
                  border: "1px solid black",
                  width: "20px",
                  height: "20px",
                  display: "inline-block",
                  backgroundColor:
                    cell == 0
                      ? "white"
                      : cell == 1
                      ? "blue"
                      : cell == 2
                      ? "red"
                      : "gray",
                };
                return (
                  <span key={j} style={style}>
                    &nbsp;
                  </span>
                );
              })}
            </div>
          );
        })}
      </main>

      <footer>
        <a
          href="https://github.com/javierlandini/tetris"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github repository
        </a>
      </footer>
    </div>
  );
}
