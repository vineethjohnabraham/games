# 🏏 Paper Cricket

A lightweight, fully-featured HTML/JavaScript cricket game that works perfectly on both desktop and mobile devices.

## Features

### Quick Game Mode
- **Team Setup**: Enter team names and customize all 11 players for both teams
- **Match Types**: Choose between Limited Overs (1-50 overs) or Test Match
- **Realistic Toss**: Random toss with choice to bat or bowl
- **Live Gameplay**: 
  - Automatic bowling with random outcomes (0, 1, 2, 3, 4, 6, Wicket)
  - Manual override buttons for custom scoring
  - Extras support (Wide, No-ball, Bye, Leg-bye)
  - Real-time score updates and statistics
- **Detailed Scorecard**: 
  - Batting stats (Runs, Balls, 4s, 6s, Strike Rate)
  - Bowling figures (Overs, Maidens, Runs, Wickets, Economy)
  - Partnership summaries
  - Fall of wickets timeline
- **Smart Features**:
  - Automatic strike rotation on odd runs
  - Over completion with bowler change
  - Wicket handling with next batsman selection
  - Innings and match end conditions
  - Player of the Match suggestion
  - Downloadable scorecard

### Tournament Mode
- Support for 2-8 teams
- Round-Robin or Knockout format
- Auto-generated match schedule
- Live points table with:
  - Matches Played, Won, Lost
  - Points and Net Run Rate
- Complete tournament tracking
- Match results history

### User Experience
- ✨ Clean, minimal design
- 📱 Fully responsive (mobile & desktop)
- 🎯 Large, easy-to-tap buttons
- 🎨 Gradient color scheme
- 🔊 Optional sound effects
- ⚡ Smooth animations
- 💾 Settings persistence (localStorage)

## How to Play

### Quick Game

1. **Setup**
   - Click "Quick Game" on home screen
   - Enter team names (or use defaults)
   - Add/edit player names for both teams
   - Select match type: Limited Overs or Test Match
   - For limited overs, choose number of overs (1-50)

2. **Toss**
   - Click the "Toss" button
   - Winner chooses to Bat or Bowl

3. **Select Opening Batsmen**
   - Choose 2 batsmen from the batting team
   - Click "Start Innings"

4. **Select Opening Bowler**
   - Choose the opening bowler
   - Click "Continue"

5. **Gameplay**
   - Click the large "BOWL" button to deliver a ball
   - Result will be randomly generated
   - **OR** use manual override buttons below to set the result yourself
   - Enable "Extras" toggle to add wides, no-balls, byes, leg-byes
   - After 6 legal balls, select next bowler
   - On wicket, select next batsman

6. **Match Progression**
   - First innings ends when:
     - All 10 wickets fall
     - Overs complete (in limited overs)
   - Second innings begins with target displayed
   - Match ends when second innings completes

7. **Result**
   - View match result and Player of the Match
   - Access detailed scorecard
   - Download scorecard as text file

### Tournament Mode

1. **Setup**
   - Click "Tournament Mode"
   - Select number of teams (2-8)
   - Choose overs per match
   - Select format: Round-Robin or Knockout
   - Enter team names and players for each team

2. **Tournament Dashboard**
   - **Schedule Tab**: View and play upcoming matches
   - **Points Table Tab**: See current standings
   - **Results Tab**: Review completed matches

3. **Playing Matches**
   - Click "Play Match" for any upcoming match
   - Play proceeds like Quick Game
   - Results automatically update points table

## Controls

### Gameplay Screen

- **BOWL Button**: Automatically generate random outcome
- **Manual Override Buttons**: 
  - 0, 1, 2, 3, 4, 6: Award runs
  - W: Record wicket
- **Extras Toggle**: Enable/disable extras
- **📊 Icon**: View detailed scorecard
- **⚙️ Icon**: Access settings

### Settings

- **Sound Effects**: Toggle on/off
- **Animations**: Toggle on/off

## Technical Details

- **Pure HTML/CSS/JavaScript**: No frameworks required
- **File Size**: ~70KB total (extremely lightweight)
- **Browser Compatibility**: All modern browsers
- **Mobile Optimized**: Touch-friendly interface
- **Offline Capable**: No internet required after initial load

## File Structure

```
cricket-html/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
└── script.js       # Game logic and interactivity
```

## Opening the Game

Simply open `index.html` in any web browser:
- Double-click the file, or
- Right-click → Open with → Your browser, or
- Drag and drop into browser window

## Tips

- Use **Test Match** mode for unlimited overs practice
- **Manual override** buttons are useful for recreating real matches
- Enable **Extras** for more realistic gameplay
- **Download scorecard** to keep records of great matches
- Tournament **Round-Robin** gives all teams equal chances
- Tournament **Knockout** for quick elimination format

## Future Enhancements (Optional)

- Super Over for tied matches
- Follow-on rules in Test matches
- DLS method for interrupted matches
- Match highlights/commentary
- Multiple tournament stages
- Player statistics across matches
- Custom team logos
- Share scorecard on social media

## Credits

Created as a simple, accessible cricket simulation game for cricket enthusiasts.

---

**Enjoy playing Paper Cricket! 🏏**
