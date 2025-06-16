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
  }
];

function displayQuestion() {
  const question = questions[currentQuestionIndex];
  document.getElementById('puzzle').textContent = question.puzzle;
  document.querySelector('.hint').textContent = question.hint;
  
  const optionButtons = document.querySelectorAll('.option-btn');
  optionButtons.forEach((btn, index) => {
    btn.textContent = question.options[index];
    btn.className = 'option-btn';
    btn.disabled = false;
    btn.onclick = () => checkAnswer(btn, index === question.correct);
  });
  
  document.getElementById('result').textContent = '';
  document.getElementById('nextBtn').style.display = 'none';
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
  } else {
    button.classList.add('wrong');
    // Show correct answer
    const correctIndex = questions[currentQuestionIndex].correct;
    optionButtons[correctIndex].classList.add('correct');
    resultElement.textContent = '❌ गलत! सही जवाब: ' + questions[currentQuestionIndex].options[correctIndex];
    resultElement.className = 'result wrong';
  }
  
  // Show next button if not last question
  if (currentQuestionIndex < questions.length - 1) {
    document.getElementById('nextBtn').style.display = 'inline-block';
  } else {
    document.getElementById('result').textContent += ` 🏆 गेम खत्म! आपका स्कोर: ${currentScore}/${questions.length * 10}`;
  }
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

// Initialize game
window.onload = function() {
  displayQuestion();
};
