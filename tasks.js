// Coin Earning System and Tasks

// Task completion tracking
let completedTasks = new Set();

// Initialize tasks system
async function initializeTasks() {
    if (!currentUser) return;
    
    try {
        // Load user's completed tasks
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            completedTasks = new Set(userData.tasksCompleted || []);
            updateTaskButtons();
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Update task buttons based on completion status
function updateTaskButtons() {
    const taskButtons = document.querySelectorAll('.btn-task');
    taskButtons.forEach(button => {
        const taskId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (completedTasks.has(taskId)) {
            button.textContent = 'पूर्ण';
            button.disabled = true;
            button.style.background = '#6c757d';
        }
    });
}

// Complete a task
async function completeTask(taskId, coinReward) {
    if (!currentUser) {
        showMessage('कृपया पहले लॉगिन करें', 'error');
        return;
    }
    
    if (completedTasks.has(taskId)) {
        showMessage('यह कार्य पहले से पूर्ण है', 'info');
        return;
    }
    
    try {
        // Add task to completed list
        completedTasks.add(taskId);
        
        // Update user document
        await db.collection('users').doc(currentUser.uid).update({
            tasksCompleted: Array.from(completedTasks),
            coins: firebase.firestore.FieldValue.increment(coinReward),
            lastTaskCompleted: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update UI
        updateUserCoins(coinReward);
        updateTaskButtons();
        
        showMessage(`कार्य पूर्ण! ${coinReward} कॉइन्स मिले`, 'success');
        
    } catch (error) {
        console.error('Error completing task:', error);
        showMessage('कार्य पूर्ण करने में त्रुटि', 'error');
        completedTasks.delete(taskId); // Remove from local set if failed
    }
}

// Watch ad for coins
async function watchAd() {
    if (!currentUser) {
        showMessage('कृपया पहले लॉगिन करें', 'error');
        return;
    }
    
    // Check if user has already watched ad today
    const today = new Date().toDateString();
    const lastAdWatch = localStorage.getItem(`lastAdWatch_${currentUser.uid}`);
    
    if (lastAdWatch === today) {
        showMessage('आज आपने पहले से विज्ञापन देखा है', 'info');
        return;
    }
    
    // Simulate ad watching (in real implementation, this would integrate with ad network)
    const adLink = 'https://www.profitableratecpm.com/xiqbbvj3e?key=62222c37761ad303b4d1b416d59d7a73';
    
    // Open ad in new window
    const adWindow = window.open(adLink, '_blank', 'width=800,height=600');
    
    // Show countdown and reward after 30 seconds
    showAdCountdown(30, async () => {
        try {
            // Reward user with coins
            await updateUserCoins(40);
            
            // Mark ad as watched today
            localStorage.setItem(`lastAdWatch_${currentUser.uid}`, today);
            
            showMessage('विज्ञापन देखने के लिए धन्यवाद! 40 कॉइन्स मिले', 'success');
            
            // Close ad window if still open
            if (adWindow && !adWindow.closed) {
                adWindow.close();
            }
            
        } catch (error) {
            console.error('Error rewarding ad watch:', error);
            showMessage('विज्ञापन रिवार्ड में त्रुटि', 'error');
        }
    });
}

// Show ad countdown
function showAdCountdown(seconds, callback) {
    const originalButton = document.querySelector('.ad-section button');
    const originalText = originalButton.textContent;
    
    originalButton.disabled = true;
    
    const countdown = setInterval(() => {
        originalButton.textContent = `कृपया प्रतीक्षा करें... ${seconds}s`;
        seconds--;
        
        if (seconds < 0) {
            clearInterval(countdown);
            originalButton.textContent = originalText;
            originalButton.disabled = false;
            callback();
        }
    }, 1000);
}

// Copy referral link
function copyReferralLink() {
    const referralInput = document.getElementById('referralLink');
    referralInput.select();
    referralInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        showMessage('रेफरल लिंक कॉपी हो गया!', 'success');
    } catch (error) {
        console.error('Error copying link:', error);
        showMessage('लिंक कॉपी करने में त्रुटि', 'error');
    }
}

// Track referral visits (this would be implemented with backend tracking)
async function trackReferralVisit(referrerUserId) {
    try {
        // In a real implementation, this would be called when someone visits via referral link
        // For now, we'll simulate it
        
        await db.collection('users').doc(referrerUserId).update({
            coins: firebase.firestore.FieldValue.increment(100),
            referralCount: firebase.firestore.FieldValue.increment(1)
        });
        
        // Log the referral
        await db.collection('referrals').add({
            referrerId: referrerUserId,
            visitTime: firebase.firestore.FieldValue.serverTimestamp(),
            rewardGiven: 100
        });
        
    } catch (error) {
        console.error('Error tracking referral:', error);
    }
}

// Daily login bonus
async function checkDailyLoginBonus() {
    if (!currentUser) return;
    
    try {
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem(`lastLogin_${currentUser.uid}`);
        
        if (lastLogin !== today) {
            // Give daily login bonus
            await updateUserCoins(10);
            localStorage.setItem(`lastLogin_${currentUser.uid}`, today);
            
            // Update last login in database
            await db.collection('users').doc(currentUser.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showMessage('दैनिक लॉगिन बोनस: 10 कॉइन्स मिले!', 'success');
        }
    } catch (error) {
        console.error('Error checking daily login bonus:', error);
    }
}

// Spin wheel for coins (bonus feature)
function createSpinWheel() {
    const wheelHTML = `
        <div class="spin-wheel-section" style="background: #f8f9fa; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem; text-align: center;">
            <h3>भाग्य का पहिया</h3>
            <p>दिन में एक बार घुमाएं और कॉइन्स जीतें!</p>
            <div class="wheel-container" style="position: relative; width: 200px; height: 200px; margin: 20px auto;">
                <div class="wheel" id="spinWheel" style="width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(#ff6b6b 0deg 60deg, #4ecdc4 60deg 120deg, #45b7d1 120deg 180deg, #96ceb4 180deg 240deg, #feca57 240deg 300deg, #ff9ff3 300deg 360deg); border: 5px solid #333; cursor: pointer; transition: transform 3s ease-out;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: white;">घुमाएं!</div>
                </div>
                <div class="wheel-pointer" style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 20px solid #333;"></div>
            </div>
            <button class="btn-primary" onclick="spinWheel()" id="spinButton">पहिया घुमाएं</button>
        </div>
    `;
    
    // Add wheel to tasks section
    const tasksSection = document.getElementById('tasksSection');
    const dailyTasks = tasksSection.querySelector('.daily-tasks');
    dailyTasks.insertAdjacentHTML('beforebegin', wheelHTML);
}

// Spin wheel function
async function spinWheel() {
    if (!currentUser) {
        showMessage('कृपया पहले लॉगिन करें', 'error');
        return;
    }
    
    // Check if user has already spun today
    const today = new Date().toDateString();
    const lastSpin = localStorage.getItem(`lastSpin_${currentUser.uid}`);
    
    if (lastSpin === today) {
        showMessage('आज आपने पहले से पहिया घुमाया है', 'info');
        return;
    }
    
    const wheel = document.getElementById('spinWheel');
    const button = document.getElementById('spinButton');
    
    button.disabled = true;
    button.textContent = 'घूम रहा है...';
    
    // Random rotation (multiple full rotations + random position)
    const randomRotation = 1440 + Math.random() * 360; // 4 full rotations + random
    wheel.style.transform = `rotate(${randomRotation}deg)`;
    
    // Calculate reward based on final position
    setTimeout(async () => {
        const finalPosition = randomRotation % 360;
        let reward = 5; // Default reward
        
        if (finalPosition < 60) reward = 50;
        else if (finalPosition < 120) reward = 20;
        else if (finalPosition < 180) reward = 10;
        else if (finalPosition < 240) reward = 30;
        else if (finalPosition < 300) reward = 15;
        else reward = 25;
        
        try {
            await updateUserCoins(reward);
            localStorage.setItem(`lastSpin_${currentUser.uid}`, today);
            
            showMessage(`बधाई हो! आपको ${reward} कॉइन्स मिले!`, 'success');
            
            button.textContent = 'कल फिर आएं';
            
        } catch (error) {
            console.error('Error giving spin reward:', error);
            showMessage('रिवार्ड देने में त्रुटि', 'error');
            button.disabled = false;
            button.textContent = 'पहिया घुमाएं';
        }
    }, 3000);
}

// Initialize tasks when user logs in
document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth state
    setTimeout(() => {
        if (currentUser) {
            initializeTasks();
            checkDailyLoginBonus();
            createSpinWheel();
        }
    }, 1500);
});

// Refresh tasks when tasks tab is shown
function initializeTasksTab() {
    if (currentUser) {
        initializeTasks();
    }
}

