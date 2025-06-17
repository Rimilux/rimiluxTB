// Emoji Puzzle Game System

// Predefined puzzle database (will be expanded with AI-like generation)
const puzzleDatabase = {
    hindi: [
        {
            emoji: "🩷+🗝",
            hint: "लड़की का नाम?",
            options: ["Payel", "Pinki", "Bhumika", "Neha"],
            correct: 0 // Payel (Pink + Key = Pinki, but Payel sounds like "Pink + L")
        },
        {
            emoji: "🌙+🎵",
            hint: "लड़की का नाम?",
            options: ["Chandni", "Sangita", "Kavita", "Sunita"],
            correct: 0 // Chandni (Moon + Music)
        },
        {
            emoji: "🌹+🍯",
            hint: "लड़की का नाम?",
            options: ["Gulshan", "Madhu", "Pushpa", "Kamala"],
            correct: 1 // Madhu (Rose + Honey)
        },
        {
            emoji: "🌟+⭐",
            hint: "लड़की का नाम?",
            options: ["Tara", "Deepika", "Jyoti", "Nisha"],
            correct: 0 // Tara (Star + Star)
        },
        {
            emoji: "🌸+🦋",
            hint: "लड़की का नाम?",
            options: ["Phool", "Titli", "Kiran", "Suman"],
            correct: 1 // Titli (Flower + Butterfly)
        },
        {
            emoji: "🏠+🔥",
            hint: "लड़के का नाम?",
            options: ["Ghar", "Agni", "Deepak", "Ankit"],
            correct: 2 // Deepak (House + Fire = Light)
        },
        {
            emoji: "🌊+🐟",
            hint: "लड़के का नाम?",
            options: ["Sagar", "Machli", "Jal", "Neer"],
            correct: 0 // Sagar (Ocean + Fish)
        },
        {
            emoji: "🎭+🎪",
            hint: "व्यवसाय?",
            options: ["कलाकार", "डॉक्टर", "शिक्षक", "इंजीनियर"],
            correct: 0 // Artist (Drama + Circus)
        },
        {
            emoji: "📚+✏️",
            hint: "व्यवसाय?",
            options: ["लेखक", "पढ़ाकू", "शिक्षक", "छात्र"],
            correct: 2 // Teacher (Books + Pencil)
        },
        {
            emoji: "🚗+🔧",
            hint: "व्यवसाय?",
            options: ["ड्राइवर", "मैकेनिक", "इंजीनियर", "सेल्समैन"],
            correct: 1 // Mechanic (Car + Wrench)
        }
    ],
    english: [
        {
            emoji: "🐝+🍯",
            hint: "Girl's name?",
            options: ["Honey", "Bee", "Sweet", "Maya"],
            correct: 0 // Honey (Bee + Honey)
        },
        {
            emoji: "🌹+🌿",
            hint: "Girl's name?",
            options: ["Rose", "Lily", "Daisy", "Jasmine"],
            correct: 0 // Rose (Rose + Leaf)
        },
        {
            emoji: "☀️+🌻",
            hint: "Girl's name?",
            options: ["Sunny", "Sunita", "Dawn", "Aurora"],
            correct: 0 // Sunny (Sun + Sunflower)
        },
        {
            emoji: "💎+💍",
            hint: "Girl's name?",
            options: ["Diamond", "Ruby", "Pearl", "Crystal"],
            correct: 0 // Diamond (Diamond + Ring)
        },
        {
            emoji: "🎵+🎤",
            hint: "Profession?",
            options: ["Singer", "Dancer", "Actor", "Musician"],
            correct: 0 // Singer (Music + Microphone)
        },
        {
            emoji: "🏥+💊",
            hint: "Profession?",
            options: ["Doctor", "Nurse", "Pharmacist", "Patient"],
            correct: 0 // Doctor (Hospital + Medicine)
        },
        {
            emoji: "🍳+👨‍🍳",
            hint: "Profession?",
            options: ["Chef", "Waiter", "Baker", "Cook"],
            correct: 0 // Chef (Cooking + Chef)
        },
        {
            emoji: "✈️+👨‍✈️",
            hint: "Profession?",
            options: ["Pilot", "Flight Attendant", "Engineer", "Mechanic"],
            correct: 0 // Pilot (Airplane + Pilot)
        },
        {
            emoji: "🎨+🖌️",
            hint: "Profession?",
            options: ["Artist", "Designer", "Painter", "Sculptor"],
            correct: 0 // Artist (Art + Brush)
        },
        {
            emoji: "🔬+🧪",
            hint: "Profession?",
            options: ["Scientist", "Researcher", "Chemist", "Doctor"],
            correct: 0 // Scientist (Microscope + Test Tube)
        }
    ]
};

// Current puzzle state
let currentPuzzle = null;
let currentLanguage = 'hindi';
let puzzleStreak = 0;
let totalCorrectAnswers = 0;

// Generate new puzzle
function generateNewPuzzle() {
    // Randomly choose language
    currentLanguage = Math.random() > 0.5 ? 'hindi' : 'english';
    
    // Get random puzzle from database
    const puzzles = puzzleDatabase[currentLanguage];
    const randomIndex = Math.floor(Math.random() * puzzles.length);
    currentPuzzle = puzzles[randomIndex];
    
    // Display puzzle
    displayPuzzle();
}

// Display puzzle on screen
function displayPuzzle() {
    if (!currentPuzzle) return;
    
    document.getElementById('puzzleEmoji').textContent = currentPuzzle.emoji;
    document.getElementById('puzzleHint').textContent = currentPuzzle.hint;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    currentPuzzle.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectOption(index);
        optionsContainer.appendChild(button);
    });
}

// Select option
async function selectOption(selectedIndex) {
    if (!currentPuzzle || !currentUser) return;
    
    const optionButtons = document.querySelectorAll('.option-btn');
    const selectedButton = optionButtons[selectedIndex];
    const correctButton = optionButtons[currentPuzzle.correct];
    
    // Disable all buttons
    optionButtons.forEach(btn => btn.style.pointerEvents = 'none');
    
    if (selectedIndex === currentPuzzle.correct) {
        // Correct answer
        selectedButton.classList.add('correct');
        puzzleStreak++;
        totalCorrectAnswers++;
        
        // Give coins
        let coinReward = 5;
        if (puzzleStreak >= 5) coinReward = 10; // Bonus for streak
        if (puzzleStreak >= 10) coinReward = 15; // Higher bonus
        
        try {
            await updateUserCoins(coinReward);
            showMessage(`सही उत्तर! ${coinReward} कॉइन्स मिले (स्ट्रीक: ${puzzleStreak})`, 'success');
            
            // Save game progress
            await saveGameProgress();
            
        } catch (error) {
            console.error('Error giving puzzle reward:', error);
            showMessage('रिवार्ड देने में त्रुटि', 'error');
        }
        
    } else {
        // Wrong answer
        selectedButton.classList.add('incorrect');
        correctButton.classList.add('correct');
        puzzleStreak = 0; // Reset streak
        
        showMessage(`गलत उत्तर! सही उत्तर: ${currentPuzzle.options[currentPuzzle.correct]}`, 'error');
    }
    
    // Auto-generate new puzzle after 3 seconds
    setTimeout(() => {
        generateNewPuzzle();
    }, 3000);
}

// Save game progress
async function saveGameProgress() {
    if (!currentUser) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).update({
            gameStats: {
                totalCorrectAnswers,
                puzzleStreak,
                lastPlayed: firebase.firestore.FieldValue.serverTimestamp()
            }
        });
    } catch (error) {
        console.error('Error saving game progress:', error);
    }
}

// Load game progress
async function loadGameProgress() {
    if (!currentUser) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.gameStats) {
                totalCorrectAnswers = userData.gameStats.totalCorrectAnswers || 0;
                puzzleStreak = userData.gameStats.puzzleStreak || 0;
            }
        }
    } catch (error) {
        console.error('Error loading game progress:', error);
    }
}

// Advanced puzzle generation (AI-like)
function generateAdvancedPuzzle() {
    const emojiSets = {
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
        nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌿', '🌱', '🌳', '🌲', '🍀', '🌾', '🌵', '🌴'],
        objects: ['🏠', '🚗', '✈️', '🚢', '🎵', '🎨', '📚', '💎', '👑', '🔑', '🎁', '🎈', '🎂'],
        food: ['🍎', '🍌', '🍇', '🍓', '🍑', '🍒', '🥝', '🍍', '🥭', '🍯', '🍰', '🍪', '🍫'],
        professions: ['👨‍⚕️', '👩‍⚕️', '👨‍🍳', '👩‍🍳', '👨‍🎓', '👩‍🎓', '👨‍💼', '👩‍💼']
    };
    
    const hindiNames = {
        girls: ['अनिता', 'सुनीता', 'गीता', 'सीता', 'रीता', 'मीरा', 'राधा', 'कृष्णा', 'दीप्ति', 'ज्योति'],
        boys: ['राम', 'श्याम', 'गोपाल', 'कृष्ण', 'अर्जुन', 'भीम', 'राज', 'विजय', 'अजय', 'संजय']
    };
    
    const englishNames = {
        girls: ['Alice', 'Emma', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'],
        boys: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas']
    };
    
    // This is a simplified version - in a real AI system, this would be much more sophisticated
    const categories = Object.keys(emojiSets);
    const category1 = categories[Math.floor(Math.random() * categories.length)];
    const category2 = categories[Math.floor(Math.random() * categories.length)];
    
    const emoji1 = emojiSets[category1][Math.floor(Math.random() * emojiSets[category1].length)];
    const emoji2 = emojiSets[category2][Math.floor(Math.random() * emojiSets[category2].length)];
    
    const language = Math.random() > 0.5 ? 'hindi' : 'english';
    const nameType = Math.random() > 0.5 ? 'girls' : 'boys';
    
    const names = language === 'hindi' ? hindiNames[nameType] : englishNames[nameType];
    const shuffledNames = [...names].sort(() => Math.random() - 0.5).slice(0, 4);
    
    return {
        emoji: `${emoji1}+${emoji2}`,
        hint: language === 'hindi' ? 
            (nameType === 'girls' ? 'लड़की का नाम?' : 'लड़के का नाम?') :
            (nameType === 'girls' ? "Girl's name?" : "Boy's name?"),
        options: shuffledNames,
        correct: Math.floor(Math.random() * 4),
        language: language
    };
}

// Enhanced puzzle with difficulty levels
function generatePuzzleByDifficulty(difficulty = 'easy') {
    let puzzle;
    
    switch (difficulty) {
        case 'easy':
            puzzle = puzzleDatabase[currentLanguage][Math.floor(Math.random() * Math.min(3, puzzleDatabase[currentLanguage].length))];
            break;
        case 'medium':
            puzzle = puzzleDatabase[currentLanguage][Math.floor(Math.random() * puzzleDatabase[currentLanguage].length)];
            break;
        case 'hard':
            puzzle = generateAdvancedPuzzle();
            break;
        default:
            puzzle = generateNewPuzzle();
    }
    
    return puzzle;
}

// Initialize game when tab is shown
function initializeGame() {
    if (currentUser) {
        loadGameProgress();
        generateNewPuzzle();
    }
}

// Game statistics display
function displayGameStats() {
    const statsHTML = `
        <div class="game-stats-display" style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0; text-align: center;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
                <div>
                    <strong style="color: #667eea;">${totalCorrectAnswers}</strong><br>
                    <small>कुल सही</small>
                </div>
                <div>
                    <strong style="color: #28a745;">${puzzleStreak}</strong><br>
                    <small>स्ट्रीक</small>
                </div>
            </div>
        </div>
    `;
    
    const gameContainer = document.querySelector('.game-container');
    const existingStats = gameContainer.querySelector('.game-stats-display');
    if (existingStats) {
        existingStats.remove();
    }
    
    gameContainer.insertAdjacentHTML('afterbegin', statsHTML);
}

// Update game stats display
function updateGameStatsDisplay() {
    const statsDisplay = document.querySelector('.game-stats-display');
    if (statsDisplay) {
        statsDisplay.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
                <div>
                    <strong style="color: #667eea;">${totalCorrectAnswers}</strong><br>
                    <small>कुल सही</small>
                </div>
                <div>
                    <strong style="color: #28a745;">${puzzleStreak}</strong><br>
                    <small>स्ट्रीक</small>
                </div>
            </div>
        `;
    }
}

// Initialize game stats display when game loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (currentUser) {
            displayGameStats();
        }
    }, 2000);
});

