let currentScore = 0;
let currentQuestionIndex = 0;

const questions = [
  {
    puzzle: "📍🔑",
    options: ["घर", "दरवाजा", "चाबी", "ताला"],
    correct: 2,
    hint: "इस emoji combination का मतलब क्या है?"
  },
  {
    puzzle: "🏃‍♂️💨",
    options: ["तेज दौड़ना", "हवा", "व्यायाम", "पसीना"],
    correct: 0,
    hint: "यह व्यक्ति क्या कर रहा है?"
  },
  {
    puzzle: "🌙⭐",
    options: ["दिन", "रात", "सूरज", "बादल"],
    correct: 1,
    hint: "यह कौन सा समय दिखा रहा है?"
  },
  {
    puzzle: "🔥💧",
    options: ["गर्म पानी", "ठंडा पानी", "बर्फ", "भाप"],
    correct: 0,
    hint: "आग और पानी मिलकर क्या बनता है?"
  },
  {
    puzzle: "📚🤓",
    options: ["पढ़ाई", "खेल", "फिल्म", "खाना"],
    correct: 0,
    hint: "यह व्यक्ति क्या कर रहा है?"
  },
  {
    puzzle: "🌧️☔",
    options: ["धूप", "बारिश", "बर्फ", "हवा"],
    correct: 1,
    hint: "मौसम कैसा है?"
  },
  {
    puzzle: "🍎🏥",
    options: ["डॉक्टर से मिलना", "सेब खाना", "अस्पताल", "स्वास्थ्य"],
    correct: 3,
    hint: "कहावत: An apple a day keeps the doctor away"
  },
  {
    puzzle: "💔😢",
    options: ["खुशी", "दुख", "गुस्सा", "प्यार"],
    correct: 1,
    hint: "यह कौन सी भावना है?"
  },
  {
    puzzle: "🌍✈️",
    options: ["यात्रा", "घर", "काम", "स्कूल"],
    correct: 0,
    hint: "दुनिया और हवाई जहाज = ?"
  },
  {
    puzzle: "🎂🎉",
    options: ["शादी", "जन्मदिन", "त्योहार", "पार्टी"],
    correct: 1,
    hint: "केक और celebration = ?"
  }
];

function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  document.getElementById('progress').style.width = progress + '%';
}

function displayQuestion() {
  const question = questions[currentQuestionIndex];
  document.getElementById('puzzle').textContent = question.puzzle;
  document.getElementById('hint').textContent = question.hint;
  
  const optionButtons = document.querySelectorAll('.option-btn');
  optionButtons.forEach((btn, index) => {
    btn.textContent = question.options[index];
    btn.className = 'option-btn';
    btn.disabled = false;
    btn.onclick = () => checkAnswer(btn, index === question.correct);
  });
  
  document.getElementById('result').textContent = '';
  document.getElementById('result').className = 'result';
  document.getElementById('nextBtn').style.display = 'none';
  
  updateProgress();
}

function checkAnswer(button, isCorrect) {
  const resultElement = document.getElementById('result');
  const optionButtons = document.querySelectorAll('.option-btn');
  
  // Disable all buttons
  optionButtons.forEach(btn => btn.disabled = true);
  
  if (isCorrect) {
    button.classList.add('correct');
    resultElement.textContent = '🎉 बिल्कुल सही!';
    resultElement.className = 'result correct';
    currentScore += 10;
    document.getElementById('score').textContent = currentScore;
    
    // Vibrate on correct answer (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  } else {
    button.classList.add('wrong');
    // Show correct answer
    const correctIndex = questions[currentQuestionIndex].correct;
    optionButtons[correctIndex].classList.add('correct');
    resultElement.textContent = '❌ गलत! सही जवाब: ' + questions[currentQuestionIndex].options[correctIndex];
    resultElement.className = 'result wrong';
    
    // Vibrate on wrong answer (if supported)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }
  
  // Show next button if not last question
  if (currentQuestionIndex < questions.length - 1) {
    setTimeout(() => {
      document.getElementById('nextBtn').style.display = 'inline-block';
    }, 1000);
  } else {
    setTimeout(() => {
      showFinalScore();
    }, 1500);
  }
}

function showFinalScore() {
  const percentage = Math.round((currentScore / (questions.length * 10)) * 100);
  let message = `🏆 गेम खत्म!\n स्कोर: ${currentScore}/${questions.length * 10} (${percentage}%)\n\n`;
  
  if (percentage >= 90) {
    message += "🌟 बहुत बढ़िया! आप emoji master हैं!";
  } else if (percentage >= 70) {
    message += "👍 अच्छा खेल! थोड़ा और practice करें।";
  } else if (percentage >= 50) {
    message += "😊 ठीक है! और कोशिश करते रहें।";
  } else {
    message += "💪 कोई बात नहीं! practice करके फिर try करें।";
  }
  
  document.getElementById('result').textContent = message;
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  }
}

function restartGame() {
  currentScore = 0;
  currentQuestionIndex = 0;
  document.getElementById('score').textContent = currentScore;
  displayQuestion();
}

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Initialize game
window.onload = function() {
  displayQuestion();
};

// Service worker registration for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('ServiceWorker registration successful');
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
