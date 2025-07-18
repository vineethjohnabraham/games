# Vintage Snake & Ladder Game

A modern, responsive web-based Snake & Ladder game built with vanilla HTML, CSS, and JavaScript. Features both single-player (vs computer) and two-player modes with smooth animations, sound effects, and mobile-friendly design.

## 🎮 Features

### Game Modes
- **Player vs Computer**: Play against an AI opponent with realistic thinking delays
- **Two Players**: Classic local multiplayer experience

### Audio & Visual Effects
- **Sound Effects**: Dice roll, snake hiss, ladder climb, piece movement, and victory sounds
- **Smooth Animations**: Medium-level animations for dice rolling, piece movement, and special effects
- **Visual Feedback**: Highlighting, particle effects, and celebration animations

### Responsive Design
- **Mobile-Friendly**: Touch-optimized controls and responsive layout
- **Cross-Platform**: Works on desktop, tablet, and mobile devices
- **Adaptive UI**: Automatically adjusts layout based on screen size

### Accessibility & Settings
- **Sound Controls**: Enable/disable sound effects and adjust volume
- **Animation Controls**: Toggle animations for users who prefer reduced motion
- **Vibration Support**: Haptic feedback on mobile devices
- **Keyboard Shortcuts**: Space/Enter to roll dice, Escape for menu, etc.

## 🎯 Game Rules

1. **Objective**: Be the first player to reach square 100
2. **Movement**: Roll the dice and move forward by the number shown
3. **Snakes**: Landing on a snake head sends you down to its tail
4. **Ladders**: Landing on a ladder bottom takes you up to its top
5. **Winning**: You must roll the exact number to reach square 100
6. **Bouncing**: Rolling more than needed makes you bounce back from 100

## 🛠 Technical Details

### Built With
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Grid layout, flexbox, animations, and responsive design
- **Vanilla JavaScript**: ES6+ features, async/await, and modular architecture

### Architecture
```
js/
├── game.js      # Main game logic and state management
├── board.js     # Game board rendering and piece movement
├── player.js    # Player management and statistics
├── ui.js        # User interface and screen management
└── audio.js     # Sound effects and audio management

css/
├── main.css      # Base styles and color scheme
├── board.css     # Game board and piece styling
├── responsive.css # Mobile and responsive design
└── animations.css # Animation effects and transitions
```

### Snake & Ladder Positions
Based on the classic board layout:

**Snakes (Head → Tail):**
- 98 → 79
- 95 → 75  
- 92 → 88
- 89 → 68
- 74 → 53
- 64 → 60
- 62 → 19
- 54 → 34
- 17 → 7

**Ladders (Bottom → Top):**
- 1 → 38
- 4 → 14
- 9 → 31
- 16 → 6
- 21 → 42
- 28 → 84
- 36 → 44
- 51 → 67
- 71 → 91
- 80 → 100

## 🚀 Getting Started

1. **Download/Clone** the project files
2. **Open** `index.html` in a modern web browser
3. **Start Playing** - no installation or build process required!

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🎵 Audio Files

The game includes fallback audio generation for browsers without audio files. For best experience, add these audio files to the `sounds/` directory:

- `dice-roll.mp3` - Dice rolling sound (~1 second)
- `snake-hiss.mp3` - Snake encounter sound (~2 seconds)  
- `ladder-climb.mp3` - Ladder climbing sound (~1.5 seconds)
- `piece-move.mp3` - Piece movement sound (~0.5 seconds)
- `game-win.mp3` - Victory fanfare (~3 seconds)
- `button-click.mp3` - UI button click sound (~0.3 seconds)

## 📱 Mobile Features

- **Touch-Friendly**: Large tap targets and optimized touch interactions
- **Responsive Layout**: Adapts to portrait and landscape orientations
- **Haptic Feedback**: Vibration support for game events
- **Gesture Support**: Swipe navigation (future enhancement)

## ⚙️ Settings & Customization

### Available Settings
- **Sound Effects**: Toggle on/off
- **Volume Control**: Adjust audio levels
- **Animations**: Enable/disable for performance or preference
- **Vibration**: Mobile haptic feedback control

### Keyboard Shortcuts
- **Space/Enter**: Roll dice
- **Escape**: Return to main menu
- **Ctrl+R**: Reset game
- **Ctrl+S**: Open settings

## 🎨 Customization

### Themes
The game uses CSS custom properties for easy theming:

```css
:root {
    --primary-color: #2c5aa0;
    --secondary-color: #5b9bd5;
    --accent-color: #ff6b35;
    /* ... more variables */
}
```

### Adding New Features
The modular architecture makes it easy to extend:

- **New Game Modes**: Extend the `SnakeLadderGame` class
- **Additional Sounds**: Add to `AudioManager`
- **Custom Animations**: Add to `animations.css`
- **New Themes**: Modify CSS custom properties

## 📊 Statistics & Storage

### Tracked Statistics
- Games played and won
- Win percentage
- Total moves made
- Snake encounters
- Ladder climbs
- Game duration

### Local Storage
- Player statistics
- Game settings
- High scores
- Game save/load functionality

## 🐛 Troubleshooting

### Common Issues
1. **No Sound**: Check browser autoplay policies, click anywhere to enable audio
2. **Layout Issues**: Ensure modern browser with CSS Grid support
3. **Performance**: Disable animations in settings if experiencing lag
4. **Mobile Issues**: Use touch instead of mouse events

### Debug Features
Access via browser console:
```javascript
game.debugMovePlayer(1, 50);  // Move player 1 to position 50
game.debugWinGame(1);         // Make player 1 win instantly
```

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Credits

- Classic Snake & Ladder game design
- Modern web development techniques
- Responsive design principles
- Accessibility best practices

---

**Enjoy the game!** 🐍🪜🎲
