// Main Application Controller

// Global state
let appInitialized = false;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Ticket Game App Loading...');
    
    // Initialize Firebase auth state listener
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize default tab
    setTimeout(() => {
        showTab('tickets');
    }, 1000);
});

// Initialize application
function initializeApp() {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded');
        showMessage('Firebase लोड नहीं हो सका', 'error');
        return;
    }
    
    console.log('Firebase initialized successfully');
    appInitialized = true;
    
    // Set up auth state change listener
    auth.onAuthStateChanged((user) => {
        handleAuthStateChange(user);
    });
}

// Handle authentication state changes
function handleAuthStateChange(user) {
    if (user) {
        console.log('User logged in:', user.email);
        currentUser = user;
        isAdmin = checkIfAdmin(user.email);
        
        // Initialize user-specific features
        initializeUserFeatures();
        
    } else {
        console.log('User logged out');
        currentUser = null;
        isAdmin = false;
        
        // Reset user-specific data
        resetUserData();
    }
}

// Initialize user-specific features
async function initializeUserFeatures() {
    try {
        // Load user data
        await loadUserData();
        
        // Initialize all systems
        await Promise.all([
            initializeTickets(),
            initializeTasks(),
            loadGameProgress()
        ]);
        
        // Check daily bonuses
        checkDailyLoginBonus();
        
        // Show appropriate interface
        showUserInterface();
        
        // Initialize admin features if admin
        if (isAdmin) {
            initializeAdminPanel();
        }
        
        console.log('User features initialized');
        
    } catch (error) {
        console.error('Error initializing user features:', error);
        showMessage('यूजर फीचर्स लोड करने में त्रुटि', 'error');
    }
}

// Reset user data
function resetUserData() {
    completedTasks.clear();
    puzzleStreak = 0;
    totalCorrectAnswers = 0;
    ticketsData = {};
    winningTicket = null;
    
    showAuthRequired();
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            const tabName = getTabNameFromButton(e.target);
            if (tabName) {
                showTab(tabName);
            }
        }
    });
    
    // Modal handling
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Admin shortcut (Ctrl+Shift+A)
        if (e.ctrlKey && e.shiftKey && e.key === 'A' && isAdmin) {
            showTab('admin');
        }
    });
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && currentUser) {
            // Refresh data when page becomes visible
            refreshUserData();
        }
    });
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        showMessage('इंटरनेट कनेक्शन बहाल हो गया', 'success');
        if (currentUser) {
            refreshUserData();
        }
    });
    
    window.addEventListener('offline', () => {
        showMessage('इंटरनेट कनेक्शन नहीं है', 'error');
    });
}

// Get tab name from button
function getTabNameFromButton(button) {
    const text = button.textContent.trim();
    switch (text) {
        case 'टिकट्स': return 'tickets';
        case 'टास्क': return 'tasks';
        case 'गेम': return 'game';
        case 'एडमिन': return 'admin';
        default: return null;
    }
}

// Enhanced show tab function
function showTab(tabName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected section
    const selectedSection = document.getElementById(tabName + 'Section');
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    // Activate corresponding tab
    const activeTab = Array.from(tabs).find(tab => 
        getTabNameFromButton(tab) === tabName
    );
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Initialize tab-specific content
    initializeTabContent(tabName);
    
    // Update URL hash (for bookmarking)
    window.location.hash = tabName;
}

// Initialize tab-specific content
function initializeTabContent(tabName) {
    switch (tabName) {
        case 'tickets':
            if (currentUser) {
                initializeTickets();
            }
            break;
        case 'tasks':
            if (currentUser) {
                initializeTasksTab();
                if (!document.querySelector('.spin-wheel-section')) {
                    createSpinWheel();
                }
            }
            break;
        case 'game':
            if (currentUser) {
                initializeGame();
                displayGameStats();
            }
            break;
        case 'admin':
            if (isAdmin) {
                initializeAdminPanel();
            }
            break;
    }
}

// Refresh user data
async function refreshUserData() {
    if (!currentUser) return;
    
    try {
        await loadUserData();
        
        // Refresh current tab content
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const tabName = getTabNameFromButton(activeTab);
            if (tabName) {
                initializeTabContent(tabName);
            }
        }
        
    } catch (error) {
        console.error('Error refreshing user data:', error);
    }
}

// Handle URL hash changes (for direct navigation)
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash && ['tickets', 'tasks', 'game', 'admin'].includes(hash)) {
        showTab(hash);
    }
});

// Initialize from URL hash on load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && ['tickets', 'tasks', 'game', 'admin'].includes(hash)) {
        setTimeout(() => showTab(hash), 1500);
    }
});

// Performance monitoring
function logPerformance(action, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`${action} took ${duration.toFixed(2)} milliseconds`);
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showMessage('एप्लिकेशन में त्रुटि हुई', 'error');
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showMessage('डेटा लोड करने में त्रुटि', 'error');
});

// Service worker registration (for offline support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// App update notification
function checkForUpdates() {
    // In a real app, this would check for new versions
    const lastVersion = localStorage.getItem('appVersion');
    const currentVersion = '1.0.0';
    
    if (lastVersion && lastVersion !== currentVersion) {
        showMessage('नया अपडेट उपलब्ध है! पेज रिफ्रेश करें', 'info');
    }
    
    localStorage.setItem('appVersion', currentVersion);
}

// Initialize update check
setTimeout(checkForUpdates, 3000);

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat('hi-IN').format(num);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function formatTime(date) {
    return new Intl.DateTimeFormat('hi-IN', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Debug mode
const DEBUG_MODE = window.location.hostname === 'localhost';

if (DEBUG_MODE) {
    console.log('Debug mode enabled');
    window.debugApp = {
        currentUser: () => currentUser,
        isAdmin: () => isAdmin,
        ticketsData: () => ticketsData,
        completedTasks: () => Array.from(completedTasks),
        showTab: showTab,
        updateUserCoins: updateUserCoins
    };
}

console.log('Main application script loaded successfully');

