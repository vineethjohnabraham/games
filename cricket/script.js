// ============ GLOBAL STATE ============
let gameState = {
    mode: null, // 'quick' or 'tournament'
    matchType: null, // 'limited' or 'test'
    totalOvers: 5,
    teams: [],
    battingTeamIndex: 0,
    bowlingTeamIndex: 1,
    currentInnings: 1,
    score: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    currentBallsInOver: [],
    striker: null,
    nonStriker: null,
    currentBowler: null,
    battingStats: {},
    bowlingStats: {},
    partnerships: [],
    currentPartnership: { runs: 0, balls: 0 },
    fallOfWickets: [],
    extras: { wide: 0, noball: 0, bye: 0, legbye: 0 },
    target: null,
    firstInningsScore: null,
    matchResult: null,
    soundEnabled: true,
    animationsEnabled: true,
    innings1Data: null,
    innings2Data: null
};

let tournamentState = {
    teams: [],
    format: 'roundrobin',
    overs: 5,
    schedule: [],
    results: [],
    pointsTable: [],
    currentMatchIndex: 0
};

// Default player names
const defaultPlayers = [
    'Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5',
    'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10', 'Player 11'
];

// ============ NAVIGATION ============
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function goHome() {
    resetGameState();
    showPage('homePage');
}

function startQuickGame() {
    gameState.mode = 'quick';
    initializeQuickGameSetup();
    showPage('quickGameSetup');
}

function startTournament() {
    gameState.mode = 'tournament';
    generateTeamInputs();
    showPage('tournamentSetup');
}

// ============ QUICK GAME SETUP ============
function initializeQuickGameSetup() {
    // Initialize match type handler
    document.querySelectorAll('input[name="matchType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const oversSelection = document.getElementById('oversSelection');
            if (e.target.value === 'test') {
                oversSelection.style.display = 'none';
                gameState.matchType = 'test';
                gameState.totalOvers = 999;
            } else {
                oversSelection.style.display = 'block';
                gameState.matchType = 'limited';
            }
        });
    });

    // Generate player inputs
    generatePlayerInputs('teamAPlayers', 'Team A');
    generatePlayerInputs('teamBPlayers', 'Team B');

    // Update team name displays
    document.getElementById('teamAName').addEventListener('input', (e) => {
        document.getElementById('teamANameDisplay').textContent = e.target.value || 'Team A';
    });
    document.getElementById('teamBName').addEventListener('input', (e) => {
        document.getElementById('teamBNameDisplay').textContent = e.target.value || 'Team B';
    });

    // Toggle extras
    document.getElementById('extrasToggle').addEventListener('change', (e) => {
        document.getElementById('extrasButtons').classList.toggle('hidden', !e.target.checked);
    });
}

function generatePlayerInputs(containerId, teamPrefix) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let i = 1; i <= 11; i++) {
        const div = document.createElement('div');
        div.className = 'player-input';
        div.innerHTML = `<input type="text" placeholder="Player ${i}" value="${teamPrefix === 'Team A' ? 'A' : 'B'}${i}" id="${containerId}_${i}">`;
        container.appendChild(div);
    }
}

function proceedToToss() {
    const teamAName = document.getElementById('teamAName').value.trim() || 'Team A';
    const teamBName = document.getElementById('teamBName').value.trim() || 'Team B';
    
    // Get overs
    const oversInput = document.getElementById('oversInput').value;
    const matchType = document.querySelector('input[name="matchType"]:checked').value;
    
    if (matchType === 'limited') {
        gameState.totalOvers = parseInt(oversInput) || 5;
        gameState.matchType = 'limited';
    } else {
        gameState.totalOvers = 999;
        gameState.matchType = 'test';
    }

    // Collect players
    const teamAPlayers = [];
    const teamBPlayers = [];
    
    for (let i = 1; i <= 11; i++) {
        const playerA = document.getElementById(`teamAPlayers_${i}`).value.trim() || `A${i}`;
        const playerB = document.getElementById(`teamBPlayers_${i}`).value.trim() || `B${i}`;
        teamAPlayers.push(playerA);
        teamBPlayers.push(playerB);
    }

    // Initialize teams
    gameState.teams = [
        { name: teamAName, players: teamAPlayers },
        { name: teamBName, players: teamBPlayers }
    ];

    showPage('tossPage');
}

// ============ TOSS ============
function performToss() {
    const winner = Math.random() < 0.5 ? 0 : 1;
    gameState.tossWinner = winner;
    
    const winnerName = gameState.teams[winner].name;
    document.getElementById('tossWinnerText').textContent = `${winnerName} won the toss!`;
    document.getElementById('tossResult').classList.remove('hidden');
    document.getElementById('tossButton').classList.add('hidden');
    
    playSound('toss');
}

function chooseToBat() {
    gameState.battingTeamIndex = gameState.tossWinner;
    gameState.bowlingTeamIndex = gameState.tossWinner === 0 ? 1 : 0;
    initializeMatch();
}

function chooseToBowl() {
    gameState.battingTeamIndex = gameState.tossWinner === 0 ? 1 : 0;
    gameState.bowlingTeamIndex = gameState.tossWinner;
    initializeMatch();
}

// ============ MATCH INITIALIZATION ============
function initializeMatch() {
    resetInningsState();
    initializeStats();
    showBatsmanSelectionModal();
}

function resetInningsState() {
    gameState.score = 0;
    gameState.wickets = 0;
    gameState.overs = 0;
    gameState.balls = 0;
    gameState.currentBallsInOver = [];
    gameState.striker = null;
    gameState.nonStriker = null;
    gameState.currentBowler = null;
    gameState.partnerships = [];
    gameState.currentPartnership = { runs: 0, balls: 0 };
    gameState.fallOfWickets = [];
    gameState.extras = { wide: 0, noball: 0, bye: 0, legbye: 0 };
}

function initializeStats() {
    const battingTeam = gameState.teams[gameState.battingTeamIndex];
    const bowlingTeam = gameState.teams[gameState.bowlingTeamIndex];
    
    gameState.battingStats = {};
    battingTeam.players.forEach(player => {
        gameState.battingStats[player] = {
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            out: false,
            dismissal: null
        };
    });
    
    gameState.bowlingStats = {};
    bowlingTeam.players.forEach(player => {
        gameState.bowlingStats[player] = {
            overs: 0,
            balls: 0,
            runs: 0,
            wickets: 0,
            maidens: 0,
            economy: 0,
            lastBowledOver: -2
        };
    });
}

// ============ BATSMAN SELECTION ============
function showBatsmanSelectionModal() {
    const modal = document.getElementById('batsmanSelectionModal');
    const list = document.getElementById('batsmanList');
    const battingTeam = gameState.teams[gameState.battingTeamIndex];
    
    list.innerHTML = '';
    battingTeam.players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'selectable-item';
        div.textContent = player;
        div.onclick = () => selectOpeningBatsman(player, div);
        list.appendChild(div);
    });
    
    modal.classList.add('active');
}

let selectedBatsmen = [];
function selectOpeningBatsman(player, element) {
    if (selectedBatsmen.includes(player)) {
        selectedBatsmen = selectedBatsmen.filter(p => p !== player);
        element.classList.remove('selected');
    } else if (selectedBatsmen.length < 2) {
        selectedBatsmen.push(player);
        element.classList.add('selected');
    }
}

function confirmBatsmen() {
    if (selectedBatsmen.length !== 2) {
        alert('Please select exactly 2 batsmen');
        return;
    }
    
    gameState.striker = selectedBatsmen[0];
    gameState.nonStriker = selectedBatsmen[1];
    gameState.partnerships.push({ batsmen: [gameState.striker, gameState.nonStriker], runs: 0, balls: 0 });
    
    document.getElementById('batsmanSelectionModal').classList.remove('active');
    selectedBatsmen = [];
    
    showBowlerSelectionModal();
}

// ============ BOWLER SELECTION ============
function showBowlerSelectionModal() {
    const modal = document.getElementById('bowlerSelectionModal');
    const list = document.getElementById('bowlerList');
    const bowlingTeam = gameState.teams[gameState.bowlingTeamIndex];
    
    list.innerHTML = '';
    bowlingTeam.players.forEach(player => {
        const stats = gameState.bowlingStats[player];
        // Bowler cannot bowl consecutive overs - must have at least 1 over gap
        const canBowl = stats.lastBowledOver !== gameState.overs - 1;
        
        const div = document.createElement('div');
        div.className = 'selectable-item' + (canBowl ? '' : ' disabled');
        div.innerHTML = `
            <strong>${player}</strong>
            <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                ${stats.overs}.${stats.balls} overs - ${stats.runs}/${stats.wickets} - Econ: ${stats.economy.toFixed(2)}
            </div>
        `;
        
        if (canBowl) {
            div.onclick = () => {
                document.querySelectorAll('#bowlerList .selectable-item').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');
                gameState.currentBowler = player;
            };
        }
        
        list.appendChild(div);
    });
    
    modal.classList.add('active');
}

function confirmBowler() {
    if (!gameState.currentBowler) {
        alert('Please select a bowler');
        return;
    }
    
    gameState.bowlingStats[gameState.currentBowler].lastBowledOver = gameState.overs;
    document.getElementById('bowlerSelectionModal').classList.remove('active');
    
    if (gameState.currentInnings === 1 && gameState.balls === 0) {
        startGameplay();
    } else {
        updateGameplayUI();
    }
}

// ============ GAMEPLAY ============
function startGameplay() {
    showPage('gameplayScreen');
    updateGameplayUI();
}

function updateGameplayUI() {
    const battingTeam = gameState.teams[gameState.battingTeamIndex];
    const bowlingTeam = gameState.teams[gameState.bowlingTeamIndex];
    
    // Header
    const matchTitle = `${battingTeam.name} vs ${bowlingTeam.name} - Innings ${gameState.currentInnings}`;
    document.getElementById('matchTitle').textContent = matchTitle;
    
    if (gameState.target) {
        document.getElementById('targetInfo').textContent = `Target: ${gameState.target} runs`;
    } else {
        document.getElementById('targetInfo').textContent = '';
    }
    
    // Batting Panel
    document.getElementById('battingTeamName').textContent = `${battingTeam.name} - Batting`;
    document.getElementById('scoreDisplay').textContent = `${gameState.score}/${gameState.wickets}`;
    
    const oversText = gameState.matchType === 'test' ? 
        `${gameState.overs}.${gameState.balls}` : 
        `${gameState.overs}.${gameState.balls} / ${gameState.totalOvers}`;
    document.getElementById('oversDisplay').textContent = oversText;
    
    // Current Batsmen
    if (gameState.striker) {
        const strikerStats = gameState.battingStats[gameState.striker];
        document.getElementById('striker').textContent = `${gameState.striker}*`;
        document.getElementById('strikerScore').textContent = `${strikerStats.runs} (${strikerStats.balls})`;
    }
    
    if (gameState.nonStriker) {
        const nonStrikerStats = gameState.battingStats[gameState.nonStriker];
        document.getElementById('nonStriker').textContent = gameState.nonStriker;
        document.getElementById('nonStrikerScore').textContent = `${nonStrikerStats.runs} (${nonStrikerStats.balls})`;
    }
    
    // Batting Lineup
    updateBattingLineup();
    
    // Bowling Panel
    document.getElementById('bowlingTeamName').textContent = `${bowlingTeam.name} - Bowling`;
    
    if (gameState.currentBowler) {
        const bowlerStats = gameState.bowlingStats[gameState.currentBowler];
        document.getElementById('bowlerName').textContent = gameState.currentBowler;
        document.getElementById('bowlerOvers').textContent = `Overs: ${bowlerStats.overs}.${bowlerStats.balls}`;
        document.getElementById('bowlerRuns').textContent = `Runs: ${bowlerStats.runs}`;
        document.getElementById('bowlerWickets').textContent = `Wickets: ${bowlerStats.wickets}`;
        document.getElementById('bowlerEconomy').textContent = `Economy: ${bowlerStats.economy.toFixed(2)}`;
    }
    
    // Over Progress
    updateOverBalls();
    
    // Bowling Lineup
    updateBowlingLineup();
    
    // Partnership
    const currentP = gameState.partnerships[gameState.partnerships.length - 1];
    if (currentP) {
        document.getElementById('partnershipDisplay').textContent = 
            `Partnership: ${currentP.runs} (${currentP.balls})`;
    }
}

function updateBattingLineup() {
    const lineup = document.getElementById('battingLineup');
    const battingTeam = gameState.teams[gameState.battingTeamIndex];
    
    lineup.innerHTML = '<h4 style="font-size: 0.9rem; margin-bottom: 10px;">Batting Order</h4>';
    
    battingTeam.players.forEach(player => {
        const stats = gameState.battingStats[player];
        const div = document.createElement('div');
        div.className = 'lineup-player' + (stats.out ? ' out' : '');
        
        const dismissalText = stats.out && stats.dismissal ? ` - ${stats.dismissal}` : '';
        div.innerHTML = `
            <span>${player}${dismissalText}</span>
            <span>${stats.runs} (${stats.balls})</span>
        `;
        lineup.appendChild(div);
    });
}

function updateBowlingLineup() {
    const lineup = document.getElementById('bowlingLineup');
    const bowlingTeam = gameState.teams[gameState.bowlingTeamIndex];
    
    lineup.innerHTML = '<h4 style="font-size: 0.9rem; margin-bottom: 10px;">Bowling Figures</h4>';
    
    bowlingTeam.players.forEach(player => {
        const stats = gameState.bowlingStats[player];
        if (stats.balls > 0 || stats.overs > 0) {
            const div = document.createElement('div');
            div.className = 'lineup-player';
            div.innerHTML = `
                <span>${player}</span>
                <span>${stats.overs}.${stats.balls} - ${stats.runs}/${stats.wickets}</span>
            `;
            lineup.appendChild(div);
        }
    });
}

function updateOverBalls() {
    const container = document.getElementById('overBalls');
    container.innerHTML = '';
    
    gameState.currentBallsInOver.forEach(ball => {
        const div = document.createElement('div');
        div.className = 'ball-result';
        
        if (ball === 0) {
            div.classList.add('dot');
            div.textContent = '•';
        } else if (ball === 1 || ball === 2 || ball === 3) {
            div.classList.add('run');
            div.textContent = ball;
        } else if (ball === 4) {
            div.classList.add('four');
            div.textContent = '4';
        } else if (ball === 6) {
            div.classList.add('six');
            div.textContent = '6';
        } else if (ball === 'W') {
            div.classList.add('wicket');
            div.textContent = 'W';
        } else if (ball === 'WD') {
            div.classList.add('wide');
            div.textContent = 'WD';
        } else if (ball === 'NB') {
            div.classList.add('noball');
            div.textContent = 'NB';
        }
        
        container.appendChild(div);
    });
}

// ============ BOWLING ACTION ============
function bowl() {
    const outcomes = [0, 1, 2, 3, 4, 6, 'W'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    processDelivery(result);
}

function processDelivery(result) {
    // Display result
    const resultDiv = document.getElementById('lastBallResult');
    resultDiv.textContent = result === 'W' ? '🏏 WICKET!' : result === 0 ? 'DOT' : `${result} ${result > 3 ? 'RUNS!' : result === 1 ? 'RUN' : 'RUNS'}`;
    resultDiv.className = `last-ball-result result-${result}`;
    
    playSound(result);
    
    // Update stats
    if (result !== 'W') {
        gameState.score += result;
        gameState.battingStats[gameState.striker].runs += result;
        gameState.battingStats[gameState.striker].balls += 1;
        gameState.bowlingStats[gameState.currentBowler].runs += result;
        
        if (result === 4) gameState.battingStats[gameState.striker].fours += 1;
        if (result === 6) gameState.battingStats[gameState.striker].sixes += 1;
        
        // Partnership
        const currentP = gameState.partnerships[gameState.partnerships.length - 1];
        currentP.runs += result;
        currentP.balls += 1;
        
        // Rotate strike on odd runs
        if (result === 1 || result === 3) {
            rotateStrike();
        }
    } else {
        // Wicket
        gameState.wickets += 1;
        gameState.battingStats[gameState.striker].balls += 1;
        gameState.battingStats[gameState.striker].out = true;
        gameState.battingStats[gameState.striker].dismissal = `b ${gameState.currentBowler}`;
        gameState.bowlingStats[gameState.currentBowler].wickets += 1;
        
        // Fall of wicket
        gameState.fallOfWickets.push({
            wicket: gameState.wickets,
            runs: gameState.score,
            batsman: gameState.striker,
            overs: `${gameState.overs}.${gameState.balls}`
        });
        
        // End partnership
        const currentP = gameState.partnerships[gameState.partnerships.length - 1];
        currentP.balls += 1;
    }
    
    // Update balls
    gameState.balls += 1;
    gameState.bowlingStats[gameState.currentBowler].balls += 1;
    gameState.currentBallsInOver.push(result);
    
    // Update bowler economy
    const bowlerStats = gameState.bowlingStats[gameState.currentBowler];
    const totalOvers = bowlerStats.overs + (bowlerStats.balls / 6);
    bowlerStats.economy = totalOvers > 0 ? bowlerStats.runs / totalOvers : 0;
    
    // Check for over complete
    if (gameState.balls === 6) {
        completeOver();
    }
    
    // Check innings end conditions
    if (checkInningsEnd()) {
        return;
    }
    
    // Handle wicket
    if (result === 'W') {
        if (gameState.wickets === 10) {
            endInnings();
        } else {
            showNextBatsmanModal();
        }
    } else {
        updateGameplayUI();
    }
}

function rotateStrike() {
    const temp = gameState.striker;
    gameState.striker = gameState.nonStriker;
    gameState.nonStriker = temp;
}

function completeOver() {
    gameState.overs += 1;
    gameState.balls = 0;
    
    // Update bowler overs
    gameState.bowlingStats[gameState.currentBowler].overs += 1;
    gameState.bowlingStats[gameState.currentBowler].balls = 0;
    
    // Check for maiden
    const isMaiden = gameState.currentBallsInOver.every(ball => ball === 0);
    if (isMaiden) {
        gameState.bowlingStats[gameState.currentBowler].maidens += 1;
    }
    
    gameState.currentBallsInOver = [];
    rotateStrike(); // Change strike at end of over
    
    // Check innings end
    if (checkInningsEnd()) {
        return;
    }
    
    showBowlerSelectionModal();
}

function checkInningsEnd() {
    // All out
    if (gameState.wickets === 10) {
        endInnings();
        return true;
    }
    
    // Overs complete (limited overs)
    if (gameState.matchType === 'limited' && gameState.overs >= gameState.totalOvers) {
        endInnings();
        return true;
    }
    
    // Target achieved
    if (gameState.target && gameState.score >= gameState.target) {
        endMatch();
        return true;
    }
    
    return false;
}

// ============ NEXT BATSMAN ============
function showNextBatsmanModal() {
    const modal = document.getElementById('nextBatsmanModal');
    const list = document.getElementById('nextBatsmanList');
    const battingTeam = gameState.teams[gameState.battingTeamIndex];
    
    const dismissedBatsman = gameState.striker;
    document.getElementById('dismissalInfo').textContent = 
        `${dismissedBatsman} is out! (${gameState.battingStats[dismissedBatsman].runs} runs)`;
    
    list.innerHTML = '';
    window.selectedNextBatsman = null;
    
    battingTeam.players.forEach(player => {
        const stats = gameState.battingStats[player];
        if (!stats.out && player !== gameState.nonStriker) {
            const div = document.createElement('div');
            div.className = 'selectable-item';
            div.textContent = player;
            div.onclick = () => {
                document.querySelectorAll('#nextBatsmanList .selectable-item').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');
                window.selectedNextBatsman = player;
            };
            list.appendChild(div);
        }
    });
    
    modal.classList.add('active');
}

function confirmNextBatsman() {
    if (!window.selectedNextBatsman) {
        alert('Please select the next batsman');
        return;
    }
    
    gameState.striker = window.selectedNextBatsman;
    
    // Start new partnership
    gameState.partnerships.push({
        batsmen: [gameState.striker, gameState.nonStriker],
        runs: 0,
        balls: 0
    });
    
    document.getElementById('nextBatsmanModal').classList.remove('active');
    window.selectedNextBatsman = null;
    
    updateGameplayUI();
}

// ============ EXTRAS ============
function addExtra(type) {
    gameState.extras[type] += 1;
    gameState.score += 1;
    
    if (type === 'wide' || type === 'noball') {
        gameState.currentBallsInOver.push(type === 'wide' ? 'WD' : 'NB');
        // Don't increment balls for wide/no-ball
    } else {
        gameState.balls += 1;
        gameState.currentBallsInOver.push(type.toUpperCase());
        
        if (gameState.balls === 6) {
            completeOver();
            return;
        }
    }
    
    updateGameplayUI();
    playSound('extra');
}

// ============ INNINGS & MATCH END ============
function endInnings() {
    if (gameState.currentInnings === 1) {
        gameState.firstInningsScore = gameState.score;
        gameState.target = gameState.score + 1;
        
        showInningsCompleteModal();
    } else {
        endMatch();
    }
}

function showInningsCompleteModal() {
    const modal = document.getElementById('inningsCompleteModal');
    const stats = document.getElementById('inningsStats');
    const battingTeam = gameState.teams[gameState.battingTeamIndex];
    
    stats.innerHTML = `
        <h3>${battingTeam.name}: ${gameState.score}/${gameState.wickets}</h3>
        <p>Overs: ${gameState.overs}.${gameState.balls}</p>
        <p style="font-size: 1.2rem; color: #f5576c; margin-top: 15px;">
            Target: ${gameState.target} runs
        </p>
    `;
    
    modal.classList.add('active');
}

function startSecondInnings() {
    document.getElementById('inningsCompleteModal').classList.remove('active');
    
    // Save first innings data
    gameState.innings1Data = {
        battingTeamIndex: gameState.battingTeamIndex,
        bowlingTeamIndex: gameState.bowlingTeamIndex,
        score: gameState.score,
        wickets: gameState.wickets,
        overs: gameState.overs,
        balls: gameState.balls,
        battingStats: JSON.parse(JSON.stringify(gameState.battingStats)),
        bowlingStats: JSON.parse(JSON.stringify(gameState.bowlingStats)),
        partnerships: JSON.parse(JSON.stringify(gameState.partnerships)),
        fallOfWickets: JSON.parse(JSON.stringify(gameState.fallOfWickets)),
        extras: JSON.parse(JSON.stringify(gameState.extras))
    };
    
    // Swap teams
    const temp = gameState.battingTeamIndex;
    gameState.battingTeamIndex = gameState.bowlingTeamIndex;
    gameState.bowlingTeamIndex = temp;
    
    gameState.currentInnings = 2;
    resetInningsState();
    initializeStats();
    
    selectedBatsmen = [];
    showBatsmanSelectionModal();
}

function endMatch() {
    // Save second innings data
    gameState.innings2Data = {
        battingTeamIndex: gameState.battingTeamIndex,
        bowlingTeamIndex: gameState.bowlingTeamIndex,
        score: gameState.score,
        wickets: gameState.wickets,
        overs: gameState.overs,
        balls: gameState.balls,
        battingStats: JSON.parse(JSON.stringify(gameState.battingStats)),
        bowlingStats: JSON.parse(JSON.stringify(gameState.bowlingStats)),
        partnerships: JSON.parse(JSON.stringify(gameState.partnerships)),
        fallOfWickets: JSON.parse(JSON.stringify(gameState.fallOfWickets)),
        extras: JSON.parse(JSON.stringify(gameState.extras))
    };
    
    determineMatchResult();
    showMatchResultModal();
}

function determineMatchResult() {
    const team1 = gameState.teams[gameState.currentInnings === 1 ? gameState.battingTeamIndex : gameState.bowlingTeamIndex];
    const team2 = gameState.teams[gameState.currentInnings === 1 ? gameState.bowlingTeamIndex : gameState.battingTeamIndex];
    
    const score1 = gameState.firstInningsScore;
    const score2 = gameState.score;
    
    if (score2 > score1) {
        gameState.matchResult = {
            winner: team2.name,
            result: `${team2.name} won by ${10 - gameState.wickets} wickets`,
            score1: score1,
            score2: score2
        };
    } else if (score1 > score2) {
        gameState.matchResult = {
            winner: team1.name,
            result: `${team1.name} won by ${score1 - score2} runs`,
            score1: score1,
            score2: score2
        };
    } else {
        gameState.matchResult = {
            winner: 'Tie',
            result: 'Match Tied!',
            score1: score1,
            score2: score2
        };
    }
}

function showMatchResultModal() {
    const modal = document.getElementById('matchResultModal');
    const content = document.getElementById('matchResultContent');
    
    const playerOfMatch = calculatePlayerOfMatch();
    
    content.innerHTML = `
        <h3 style="color: #667eea; margin-bottom: 20px;">${gameState.matchResult.result}</h3>
        <div style="background: #f8f9ff; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p><strong>${gameState.teams[0].name}:</strong> ${gameState.matchResult.score1} runs</p>
            <p><strong>${gameState.teams[1].name}:</strong> ${gameState.matchResult.score2} runs</p>
        </div>
        ${playerOfMatch ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <strong>🏆 Player of the Match:</strong> ${playerOfMatch}
            </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
    playSound('win');
}

function calculatePlayerOfMatch() {
    // Simple logic: highest runs or most wickets
    let bestBatsman = { name: '', runs: 0 };
    let bestBowler = { name: '', wickets: 0 };
    
    Object.entries(gameState.battingStats).forEach(([name, stats]) => {
        if (stats.runs > bestBatsman.runs) {
            bestBatsman = { name, runs: stats.runs };
        }
    });
    
    Object.entries(gameState.bowlingStats).forEach(([name, stats]) => {
        if (stats.wickets > bestBowler.wickets) {
            bestBowler = { name, wickets: stats.wickets };
        }
    });
    
    if (bestBowler.wickets >= 3) {
        return `${bestBowler.name} (${bestBowler.wickets} wickets)`;
    } else if (bestBatsman.runs >= 30) {
        return `${bestBatsman.name} (${bestBatsman.runs} runs)`;
    }
    
    return bestBatsman.name ? `${bestBatsman.name} (${bestBatsman.runs} runs)` : null;
}

function viewFinalScorecard() {
    document.getElementById('matchResultModal').classList.remove('active');
    toggleScorecard();
}

// ============ SCORECARD ============
function toggleScorecard() {
    const modal = document.getElementById('scorecardModal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
    } else {
        generateScorecard();
        modal.classList.add('active');
    }
}

function generateScorecard() {
    const content = document.getElementById('scorecardContent');
    let html = '';
    
    // Function to generate innings scorecard
    const generateInningsCard = (inningsData, inningsNumber) => {
        const battingTeam = gameState.teams[inningsData.battingTeamIndex];
        const bowlingTeam = gameState.teams[inningsData.bowlingTeamIndex];
        
        let inningsHtml = `
            <div class="scorecard-section">
                <h3 style="background: #667eea; color: white; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                    ${battingTeam.name} Innings ${inningsNumber} - ${inningsData.score}/${inningsData.wickets} (${inningsData.overs}.${inningsData.balls} overs)
                </h3>
                <table class="scorecard-table">
                    <thead>
                        <tr>
                            <th>Batsman</th>
                            <th>R</th>
                            <th>B</th>
                            <th>4s</th>
                            <th>6s</th>
                            <th>SR</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        battingTeam.players.forEach(player => {
            const stats = inningsData.battingStats[player];
            if (stats && (stats.balls > 0 || stats.out)) {
                const sr = stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(2) : '0.00';
                const dismissal = stats.out ? stats.dismissal : 'Not Out';
                inningsHtml += `
                    <tr>
                        <td>${player} ${stats.out ? '' : '*'}<br><small style="color: #666;">${dismissal}</small></td>
                        <td>${stats.runs}</td>
                        <td>${stats.balls}</td>
                        <td>${stats.fours}</td>
                        <td>${stats.sixes}</td>
                        <td>${sr}</td>
                    </tr>
                `;
            }
        });
        
        const totalExtras = Object.values(inningsData.extras).reduce((a, b) => a + b, 0);
        inningsHtml += `
                    </tbody>
                </table>
                <div style="margin-top: 15px; font-size: 0.95rem;">
                    <strong>Extras:</strong> ${totalExtras} 
                    (WD: ${inningsData.extras.wide}, NB: ${inningsData.extras.noball}, B: ${inningsData.extras.bye}, LB: ${inningsData.extras.legbye})
                </div>
            </div>
            
            <div class="scorecard-section">
                <h3>${bowlingTeam.name} Bowling</h3>
                <table class="scorecard-table">
                    <thead>
                        <tr>
                            <th>Bowler</th>
                            <th>O</th>
                            <th>M</th>
                            <th>R</th>
                            <th>W</th>
                            <th>Econ</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        bowlingTeam.players.forEach(player => {
            const stats = inningsData.bowlingStats[player];
            if (stats && (stats.balls > 0 || stats.overs > 0)) {
                inningsHtml += `
                    <tr>
                        <td>${player}</td>
                        <td>${stats.overs}.${stats.balls}</td>
                        <td>${stats.maidens}</td>
                        <td>${stats.runs}</td>
                        <td>${stats.wickets}</td>
                        <td>${stats.economy.toFixed(2)}</td>
                    </tr>
                `;
            }
        });
        
        inningsHtml += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Fall of Wickets
        if (inningsData.fallOfWickets && inningsData.fallOfWickets.length > 0) {
            inningsHtml += `
                <div class="scorecard-section">
                    <h4>Fall of Wickets</h4>
                    <p style="font-size: 0.9rem;">
            `;
            
            inningsData.fallOfWickets.forEach((fow, i) => {
                inningsHtml += `${fow.runs}-${fow.wicket} (${fow.batsman}, ${fow.overs} ov)${i < inningsData.fallOfWickets.length - 1 ? ', ' : ''}`;
            });
            
            inningsHtml += `
                    </p>
                </div>
            `;
        }
        
        return inningsHtml;
    };
    
    // Show both innings if match is complete
    if (gameState.innings1Data) {
        html += generateInningsCard(gameState.innings1Data, 1);
        html += '<hr style="margin: 30px 0; border: 2px solid #667eea;">';
    }
    
    if (gameState.innings2Data) {
        html += generateInningsCard(gameState.innings2Data, 2);
    } else if (gameState.currentInnings === 1) {
        // Show current innings if first innings is ongoing
        const currentData = {
            battingTeamIndex: gameState.battingTeamIndex,
            bowlingTeamIndex: gameState.bowlingTeamIndex,
            score: gameState.score,
            wickets: gameState.wickets,
            overs: gameState.overs,
            balls: gameState.balls,
            battingStats: gameState.battingStats,
            bowlingStats: gameState.bowlingStats,
            partnerships: gameState.partnerships,
            fallOfWickets: gameState.fallOfWickets,
            extras: gameState.extras
        };
        html += generateInningsCard(currentData, 1);
    } else if (gameState.currentInnings === 2) {
        // Show both innings during second innings
        html += generateInningsCard(gameState.innings1Data, 1);
        html += '<hr style="margin: 30px 0; border: 2px solid #667eea;">';
        
        const currentData = {
            battingTeamIndex: gameState.battingTeamIndex,
            bowlingTeamIndex: gameState.bowlingTeamIndex,
            score: gameState.score,
            wickets: gameState.wickets,
            overs: gameState.overs,
            balls: gameState.balls,
            battingStats: gameState.battingStats,
            bowlingStats: gameState.bowlingStats,
            partnerships: gameState.partnerships,
            fallOfWickets: gameState.fallOfWickets,
            extras: gameState.extras
        };
        html += generateInningsCard(currentData, 2);
    }
    
    content.innerHTML = html;
}

function downloadScorecard() {
    const content = document.getElementById('scorecardContent').innerText;
    const battingTeam = gameState.teams[gameState.battingTeamIndex];
    const filename = `scorecard_${battingTeam.name}_${new Date().getTime()}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    playSound('success');
}

// ============ TOURNAMENT MODE ============
function generateTeamInputs() {
    const numTeams = parseInt(document.getElementById('numTeams').value) || 4;
    const container = document.getElementById('tournamentTeamsContainer');
    
    container.innerHTML = '';
    
    for (let i = 1; i <= numTeams; i++) {
        const div = document.createElement('div');
        div.className = 'tournament-team-input';
        
        let playersHTML = '';
        for (let j = 1; j <= 11; j++) {
            playersHTML += `
                <div class="player-input" style="margin-bottom: 8px;">
                    <input type="text" placeholder="Player ${j}" value="T${i}P${j}" id="tourTeam${i}_player${j}">
                </div>
            `;
        }
        
        div.innerHTML = `
            <h4>Team ${i}</h4>
            <div class="input-group">
                <label>Team Name:</label>
                <input type="text" id="tourTeam${i}_name" placeholder="Team ${i}" value="Team ${i}">
            </div>
            <div style="max-height: 200px; overflow-y: auto;">
                ${playersHTML}
            </div>
        `;
        
        container.appendChild(div);
    }
}

function startTournamentMatches() {
    const numTeams = parseInt(document.getElementById('numTeams').value) || 4;
    const format = document.querySelector('input[name="tournamentFormat"]:checked').value;
    const overs = parseInt(document.getElementById('tournamentOvers').value) || 5;
    
    // Collect teams
    tournamentState.teams = [];
    for (let i = 1; i <= numTeams; i++) {
        const name = document.getElementById(`tourTeam${i}_name`).value || `Team ${i}`;
        const players = [];
        
        for (let j = 1; j <= 11; j++) {
            const player = document.getElementById(`tourTeam${i}_player${j}`).value || `T${i}P${j}`;
            players.push(player);
        }
        
        tournamentState.teams.push({ name, players, matchesPlayed: 0, won: 0, lost: 0, points: 0, nrr: 0 });
    }
    
    tournamentState.format = format;
    tournamentState.overs = overs;
    tournamentState.results = [];
    
    // Generate schedule
    if (format === 'roundrobin') {
        generateRoundRobinSchedule();
    } else {
        generateKnockoutSchedule();
    }
    
    showTournamentDashboard();
}

function generateRoundRobinSchedule() {
    tournamentState.schedule = [];
    const teams = tournamentState.teams;
    
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            tournamentState.schedule.push({
                team1: i,
                team2: j,
                played: false,
                winner: null
            });
        }
    }
}

function generateKnockoutSchedule() {
    tournamentState.schedule = [];
    const teams = tournamentState.teams;
    
    // First round
    for (let i = 0; i < teams.length; i += 2) {
        if (i + 1 < teams.length) {
            tournamentState.schedule.push({
                team1: i,
                team2: i + 1,
                played: false,
                winner: null,
                round: 1
            });
        }
    }
}

function showTournamentDashboard() {
    showPage('tournamentDashboard');
    updateTournamentSchedule();
    updatePointsTable();
}

function updateTournamentSchedule() {
    const list = document.getElementById('scheduleList');
    list.innerHTML = '';
    
    tournamentState.schedule.forEach((match, index) => {
        const team1 = tournamentState.teams[match.team1];
        const team2 = tournamentState.teams[match.team2];
        
        const div = document.createElement('div');
        div.className = `match-card ${match.played ? 'completed' : 'upcoming'}`;
        
        div.innerHTML = `
            <h4>Match ${index + 1}</h4>
            <p><strong>${team1.name}</strong> vs <strong>${team2.name}</strong></p>
            ${match.played ? 
                `<p style="color: #4CAF50;">Winner: ${tournamentState.teams[match.winner].name}</p>` :
                `<button class="btn btn-primary" onclick="playTournamentMatch(${index})">Play Match</button>`
            }
        `;
        
        list.appendChild(div);
    });
}

function updatePointsTable() {
    const table = document.getElementById('pointsTable');
    
    // Sort teams by points, then NRR
    const sortedTeams = [...tournamentState.teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.nrr - a.nrr;
    });
    
    let html = `
        <div class="points-table-grid">
            <table class="scorecard-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Team</th>
                        <th>M</th>
                        <th>W</th>
                        <th>L</th>
                        <th>Pts</th>
                        <th>NRR</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    sortedTeams.forEach((team, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${team.name}</strong></td>
                <td>${team.matchesPlayed}</td>
                <td>${team.won}</td>
                <td>${team.lost}</td>
                <td>${team.points}</td>
                <td>${team.nrr.toFixed(3)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    table.innerHTML = html;
}

function playTournamentMatch(matchIndex) {
    const match = tournamentState.schedule[matchIndex];
    const team1 = tournamentState.teams[match.team1];
    const team2 = tournamentState.teams[match.team2];
    
    // Setup quick game with tournament teams
    gameState.mode = 'tournament';
    gameState.matchType = 'limited';
    gameState.totalOvers = tournamentState.overs;
    gameState.teams = [team1, team2];
    gameState.currentTournamentMatch = matchIndex;
    
    // Random toss
    gameState.tossWinner = Math.random() < 0.5 ? 0 : 1;
    gameState.battingTeamIndex = gameState.tossWinner;
    gameState.bowlingTeamIndex = gameState.tossWinner === 0 ? 1 : 0;
    
    initializeMatch();
}

function recordTournamentResult() {
    const matchIndex = gameState.currentTournamentMatch;
    const match = tournamentState.schedule[matchIndex];
    
    match.played = true;
    
    const team1Index = match.team1;
    const team2Index = match.team2;
    
    if (gameState.matchResult.winner === gameState.teams[0].name) {
        match.winner = team1Index;
        tournamentState.teams[team1Index].won += 1;
        tournamentState.teams[team1Index].points += 2;
        tournamentState.teams[team2Index].lost += 1;
    } else if (gameState.matchResult.winner === gameState.teams[1].name) {
        match.winner = team2Index;
        tournamentState.teams[team2Index].won += 1;
        tournamentState.teams[team2Index].points += 2;
        tournamentState.teams[team1Index].lost += 1;
    } else {
        // Tie - 1 point each
        tournamentState.teams[team1Index].points += 1;
        tournamentState.teams[team2Index].points += 1;
    }
    
    tournamentState.teams[team1Index].matchesPlayed += 1;
    tournamentState.teams[team2Index].matchesPlayed += 1;
    
    // Simple NRR calculation (can be improved)
    tournamentState.teams[team1Index].nrr = (Math.random() - 0.5) * 2;
    tournamentState.teams[team2Index].nrr = (Math.random() - 0.5) * 2;
    
    tournamentState.results.push({
        team1: gameState.teams[0].name,
        team2: gameState.teams[1].name,
        result: gameState.matchResult.result,
        score1: gameState.matchResult.score1,
        score2: gameState.matchResult.score2
    });
}

// Override match end for tournament
const originalEndMatch = endMatch;
endMatch = function() {
    determineMatchResult();
    
    if (gameState.mode === 'tournament') {
        recordTournamentResult();
    }
    
    showMatchResultModal();
};

function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    if (tabName === 'schedule') {
        updateTournamentSchedule();
    } else if (tabName === 'points') {
        updatePointsTable();
    } else if (tabName === 'results') {
        updateResultsList();
    }
}

function updateResultsList() {
    const list = document.getElementById('resultsList');
    list.innerHTML = '';
    
    if (tournamentState.results.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666;">No matches completed yet</p>';
        return;
    }
    
    tournamentState.results.forEach((result, index) => {
        const div = document.createElement('div');
        div.className = 'match-card completed';
        div.innerHTML = `
            <h4>Match ${index + 1}</h4>
            <p><strong>${result.team1}:</strong> ${result.score1} runs</p>
            <p><strong>${result.team2}:</strong> ${result.score2} runs</p>
            <p style="color: #4CAF50; font-weight: 600;">${result.result}</p>
        `;
        list.appendChild(div);
    });
}

// ============ SETTINGS & UTILITIES ============
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.toggle('active');
}

function toggleSound() {
    gameState.soundEnabled = document.getElementById('soundToggle').checked;
}

function toggleAnimations() {
    gameState.animationsEnabled = document.getElementById('animationsToggle').checked;
}

function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    // Simple beep sounds using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    let frequency = 440;
    let duration = 0.1;
    
    switch(type) {
        case 4:
        case 6:
            frequency = 880;
            duration = 0.2;
            break;
        case 'W':
            frequency = 220;
            duration = 0.3;
            break;
        case 'win':
            frequency = 660;
            duration = 0.5;
            break;
        case 'toss':
            frequency = 550;
            duration = 0.15;
            break;
    }
    
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function resetGameState() {
    gameState = {
        mode: null,
        matchType: null,
        totalOvers: 5,
        teams: [],
        battingTeamIndex: 0,
        bowlingTeamIndex: 1,
        currentInnings: 1,
        score: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        currentBallsInOver: [],
        striker: null,
        nonStriker: null,
        currentBowler: null,
        battingStats: {},
        bowlingStats: {},
        partnerships: [],
        currentPartnership: { runs: 0, balls: 0 },
        fallOfWickets: [],
        extras: { wide: 0, noball: 0, bye: 0, legbye: 0 },
        target: null,
        firstInningsScore: null,
        matchResult: null,
        soundEnabled: gameState.soundEnabled,
        animationsEnabled: gameState.animationsEnabled,
        innings1Data: null,
        innings2Data: null
    };
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Set initial page
    showPage('homePage');
    
    // Load settings from localStorage
    const savedSound = localStorage.getItem('soundEnabled');
    const savedAnimations = localStorage.getItem('animationsEnabled');
    
    if (savedSound !== null) {
        gameState.soundEnabled = savedSound === 'true';
        document.getElementById('soundToggle').checked = gameState.soundEnabled;
    }
    
    if (savedAnimations !== null) {
        gameState.animationsEnabled = savedAnimations === 'true';
        document.getElementById('animationsToggle').checked = gameState.animationsEnabled;
    }
    
    // Save settings on change
    document.getElementById('soundToggle').addEventListener('change', () => {
        localStorage.setItem('soundEnabled', gameState.soundEnabled);
    });
    
    document.getElementById('animationsToggle').addEventListener('change', () => {
        localStorage.setItem('animationsEnabled', gameState.animationsEnabled);
    });
});
