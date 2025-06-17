// Authentication System
let currentUser = null;
let isAdmin = false;

// Initialize authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        isAdmin = checkIfAdmin(user.email);
        showUserInterface();
        loadUserData();
    } else {
        currentUser = null;
        isAdmin = false;
        showAuthRequired();
    }
});

// Check if user is admin
function checkIfAdmin(email) {
    return email === ADMIN_EMAIL;
}

// Show user interface
function showUserInterface() {
    document.getElementById('authRequired').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    
    // Show admin tab if user is admin
    if (isAdmin) {
        document.getElementById('adminTab').style.display = 'block';
    }
    
    // Update user info
    document.getElementById('username').textContent = currentUser.displayName || currentUser.email;
}

// Show authentication required
function showAuthRequired() {
    document.getElementById('authRequired').style.display = 'block';
    document.getElementById('appContent').style.display = 'none';
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('adminTab').style.display = 'none';
}

// Load user data from Firestore
async function loadUserData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('userCoins').textContent = userData.coins || 0;
        } else {
            // Create new user document
            await createUserDocument();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showMessage('डेटा लोड करने में त्रुटि', 'error');
    }
}

// Create user document in Firestore
async function createUserDocument() {
    try {
        const userData = {
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            coins: 100, // Starting coins
            tickets: [],
            tasksCompleted: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(currentUser.uid).set(userData);
        document.getElementById('userCoins').textContent = '100';
        showMessage('स्वागत है! आपको 100 कॉइन्स मिले हैं', 'success');
    } catch (error) {
        console.error('Error creating user document:', error);
        showMessage('यूजर डेटा बनाने में त्रुटि', 'error');
    }
}

// Update user coins
async function updateUserCoins(amount) {
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        await userRef.update({
            coins: firebase.firestore.FieldValue.increment(amount)
        });
        
        // Update UI
        const currentCoins = parseInt(document.getElementById('userCoins').textContent);
        document.getElementById('userCoins').textContent = currentCoins + amount;
        
        if (amount > 0) {
            showMessage(`${amount} कॉइन्स जोड़े गए!`, 'success');
        }
    } catch (error) {
        console.error('Error updating coins:', error);
        showMessage('कॉइन्स अपडेट करने में त्रुटि', 'error');
    }
}

// Show login modal
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    closeModal('signupModal');
}

// Show signup modal
function showSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
    closeModal('loginModal');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Login with email and password
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        closeModal('loginModal');
        showMessage('सफलतापूर्वक लॉगिन हो गए!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showMessage('लॉगिन में त्रुटि: ' + getErrorMessage(error.code), 'error');
    }
});

// Signup with email and password
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile with display name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        closeModal('signupModal');
        showMessage('सफलतापूर्वक साइन अप हो गए!', 'success');
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('साइन अप में त्रुटि: ' + getErrorMessage(error.code), 'error');
    }
});

// Login with Google
async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        closeModal('loginModal');
        closeModal('signupModal');
        showMessage('Google से सफलतापूर्वक लॉगिन हो गए!', 'success');
    } catch (error) {
        console.error('Google login error:', error);
        showMessage('Google लॉगिन में त्रुटि: ' + getErrorMessage(error.code), 'error');
    }
}

// Logout
async function logout() {
    try {
        await auth.signOut();
        showMessage('सफलतापूर्वक लॉगआउट हो गए!', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('लॉगआउट में त्रुटि', 'error');
    }
}

// Get user-friendly error messages
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'यूजर नहीं मिला';
        case 'auth/wrong-password':
            return 'गलत पासवर्ड';
        case 'auth/email-already-in-use':
            return 'ईमेल पहले से उपयोग में है';
        case 'auth/weak-password':
            return 'पासवर्ड कमजोर है';
        case 'auth/invalid-email':
            return 'अमान्य ईमेल';
        case 'auth/popup-closed-by-user':
            return 'पॉपअप बंद कर दिया गया';
        default:
            return 'अज्ञात त्रुटि';
    }
}

// Show message to user
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add to page
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

