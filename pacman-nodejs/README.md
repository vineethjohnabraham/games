# Classic Pac-Man Game

A browser-based implementation of the classic Pac-Man game with modern features including player name input and adjustable difficulty levels.

## Features

- **Player Name Input**: Enter your name before starting the game
- **5 Difficulty Levels**: Choose from Slow to Insane speed levels
- **Classic Gameplay**: Navigate through the maze, collect dots, and avoid ghosts
- **Progressive Levels**: Complete levels to advance with increasing difficulty
- **Score System**: Earn points for dots (10 points) and power pellets (50 points)
- **Lives System**: Start with 3 lives
- **Mobile Touch Support**: Full touch controls for mobile devices
- **Responsive Design**: Works perfectly on both desktop and mobile devices
- **Swipe Gestures**: Intuitive swipe controls on touchscreens

## How to Play

1. **Start the Game**:
   - Enter your name in the input field
   - Select your preferred difficulty level (1-5)
   - Click "Start Game"

2. **Controls**:
   
   **Desktop:**
   - Use arrow keys to move Pac-Man
   - Spacebar to pause/resume the game
   
   **Mobile/Touch Devices:**
   - **Touch Buttons**: Use the directional buttons (↑↓←→) at the bottom of the screen
   - **Swipe Gestures**: Swipe on the game canvas in any direction to move Pac-Man
   - **Pause Button**: Tap the pause button (⏸) in the center of the touch controls
   
   - Collect all dots to advance to the next level
   - Avoid the colorful ghosts

3. **Scoring**:
   - Small dots: 10 points each
   - Power pellets (large dots): 50 points each
   - Level completion bonus: 100 points

## Game Levels

- **Level 1**: Slow speed - Perfect for beginners
- **Level 2**: Medium speed - Balanced gameplay
- **Level 3**: Fast speed - Challenging experience
- **Level 4**: Very Fast speed - Expert level
- **Level 5**: Insane speed - For true Pac-Man masters

## Installation and Setup

### Option 1: Simple File Opening
1. Download all files to a folder
2. Open `index.html` in any modern web browser

### Option 2: Local Server (Recommended)
1. Make sure you have Node.js installed
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. The game will open automatically in your browser at `http://localhost:3000`

## File Structure

```
pacman-nodejs/
├── index.html          # Main HTML file
├── style.css           # Game styling and layout
├── game.js             # Game logic and mechanics
├── package.json        # Node.js project configuration
└── README.md           # This file
```

## Game Mechanics

### Pac-Man Movement
- Moves in a grid-based system
- Can change direction when a valid path is available
- Wraps around the screen (tunnel effect on left/right edges)
- Mouth animation based on movement

### Ghost Behavior
- Four uniquely colored ghosts with simple AI
- Mix of random movement and Pac-Man targeting
- Cannot move through walls
- Collision with Pac-Man results in life loss

### Level Progression
- Each level increases the game speed
- Map resets with all dots restored
- Ghost and Pac-Man positions reset
- Score is preserved between levels

## Mobile Touch Controls

### Touch Buttons
- **Directional Controls**: Four arrow buttons (↑↓←→) for movement
- **Pause Button**: Central pause/resume button (⏸)
- **Responsive Layout**: Touch controls automatically appear on mobile devices
- **Visual Feedback**: Buttons respond with visual feedback when pressed

### Swipe Gestures
- **Canvas Swipes**: Swipe directly on the game canvas to control Pac-Man
- **Minimum Distance**: Swipe at least 30 pixels for gesture recognition
- **All Directions**: Supports up, down, left, and right swipes
- **Smooth Control**: Intuitive and responsive gesture recognition

### Mobile Optimizations
- **Automatic Detection**: Touch controls appear automatically on mobile devices
- **Responsive Canvas**: Game canvas scales appropriately for mobile screens
- **Touch-Friendly Buttons**: Large, easy-to-tap control buttons
- **Landscape Support**: Optimized layout for both portrait and landscape orientations

## Browser Compatibility

This game works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript features
- CSS3 animations
- Touch events (for mobile devices)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

## Customization

You can easily customize the game by modifying:

- **Game speed**: Adjust the `speeds` object in `game.js`
- **Maze layout**: Modify the `originalMap` array in `game.js`
- **Colors and styling**: Update values in `style.css`
- **Scoring system**: Change point values in the `movePacman` method

## Future Enhancements

Potential features to add:
- Sound effects and background music
- High score persistence
- Power pellet mode (ghosts become vulnerable)
- Additional maze layouts
- Multiplayer support
- Haptic feedback for mobile devices
- Orientation lock options

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

---

Enjoy playing this classic Pac-Man game! 🟡👻
