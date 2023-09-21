import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from "react";

class Tetris {
  #X_BOARD;
  #Y_BOARD;
  MAX_SPEED;
  board;
  piece;
  score;
  gameOver;
  speed;
  constructor() {
    this.#X_BOARD = 10;
    this.#Y_BOARD = 20;
    this.SHAPES = [
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
    this.board = Array(this.#Y_BOARD)
      .fill(0)
      .map(() => Array(this.#X_BOARD).fill(0));

    this.score = 0;
    this.gameOver = false;
    this.speed = 0;
    this.MAX_SPEED = 4;
    this.generatePiece();
  }

  generatePiece() {
    const shape = this.SHAPES[Math.floor(Math.random() * this.SHAPES.length)];
    this.piece = {
      x: Math.floor(Math.random() * (this.#X_BOARD - shape[0].length + 1)),
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

    while (this.piece.y + this.piece.shape.length > this.#Y_BOARD) {
      this.piece.y--;
    }

    while (this.piece.x + this.piece.shape[0].length > this.#X_BOARD) {
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
          this.gameOver = true;
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
            (newX < 0 || newX + this.piece.shape[0].length > this.#X_BOARD)) ||
          (dy != 0 &&
            (newY < 0 || newY + this.piece.shape.length > this.#Y_BOARD)) ||
          (this.board[newY + y][newX + x] > 0 && this.piece.shape[y][x] == 1)
        ) {
          validMove = false;
        }
        // Check if we need to stick the piece.
        if (
          dy &&
          (newY + this.piece.shape.length - 1 === this.#Y_BOARD ||
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
      for (let x = 0; x < this.#X_BOARD; x++) {
        if (line[x] !== 2) {
          return true;
        }
      }
    });
    while (this.board.length < this.#Y_BOARD) {
      this.board.unshift(Array(this.#X_BOARD).fill(0));
      lines++;
    }
    this.score = this.score + lines * lines * 100;
    this.speed =
      Math.floor(this.score / 1000) > this.MAX_SPEED
        ? 4
        : Math.floor(this.score / 1000);
  }
}
const tetris = new Tetris();

export default function Home() {
  const [_, setState] = useState({});
  const [counter, setCounter] = useState(tetris.MAX_SPEED);
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
      if (tetris.gameOver) {
        return;
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
      if (!tetris.gameOver) {
        if (counter <= tetris.speed) {
          // Reset counter.
          setCounter(tetris.MAX_SPEED);
          tetris.movePiece(0, 1);
        } else {
          setCounter(counter - 1);
        }
      }
      setState({});
    }, 100);

    return () => clearInterval(id);
  }, [counter]);

  return (
    <div className={styles.container} style={container_style}>
      <Head>
        <title>Tetris example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={tetris.gameOver ? "game-over" : ""}>
        <div className="game-over-msg">
          {tetris.gameOver ? "GAME OVER" : null}
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
