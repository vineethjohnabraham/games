# Tetris Game

A simple, modern Tetris game built with HTML5 Canvas and JavaScript.

## Features

- Classic Tetris gameplay with all 7 standard pieces (I, O, T, S, Z, J, L)
- Beautiful modern UI with glassmorphism design
- Score tracking, line clearing, and level progression
- Smooth animations and responsive controls
- Pause/resume functionality
- Game over detection and restart option

## Controls

- **←/→ Arrow Keys**: Move piece left/right
- **↓ Arrow Key**: Soft drop (faster fall)
- **↑ Arrow Key**: Rotate piece
- **Spacebar**: Hard drop (instant drop)
- **P**: Pause/unpause game
- **R**: Restart game

## How to Play

1. Pieces fall from the top of the board
2. Use the arrow keys to move and rotate pieces
3. Complete horizontal lines to clear them and earn points
4. Game speeds up as you clear more lines
5. Game ends when pieces reach the top

## Scoring

- **Line Clear**: 100 points × current level
- **Level**: Increases every 10 lines cleared
- **Speed**: Increases with each level

## Getting Started

### Option 1: Direct File Opening
Simply open `index.html` in your web browser.

### Option 2: Local Server (Recommended)
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The game will open in your default browser at `http://localhost:3000`

## File Structure

```
tetris-game/
├── index.html      # Main HTML file with game UI
├── tetris.js       # Game logic and mechanics
├── package.json    # Project configuration
└── README.md       # This file
```

## Game Mechanics

- **Collision Detection**: Prevents pieces from moving through walls or other pieces
- **Line Clearing**: Removes completed horizontal lines
- **Rotation**: Pieces rotate clockwise with boundary checking
- **Drop System**: Pieces fall automatically with increasing speed
- **Level Progression**: Speed increases every 10 lines cleared

## Browser Compatibility

This game works in all modern browsers that support:
- HTML5 Canvas
- ES6 Classes
- RequestAnimationFrame

Enjoy playing Tetris! 🎮
