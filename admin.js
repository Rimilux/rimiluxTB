// Admin Panel Functions
let allUsers = [];

// Announce winner
async function announceWinner() {
    if (!isAdmin) {
        showMessage('केवल एडमिन ही विजेता घोषित कर सकते हैं', 'error');
        return;
    }
    
    const ticketNumber = parseInt(document.getElementById('winningTicketNumber').value);
    
    if (!ticketNumber || ticketNumber < 1 || ticketNumber > TOTAL_TICKETS) {
        showMessage('कृपया 1 से 10000 के बीच एक वैध टिकट नंबर डालें', 'error');
        return;
    }
    
    try {
        // Update tickets data with winning ticket
        ticketsData.winningTicket = ticketNumber;
        winningTicket = ticketNumber;
        
        // Save to Firestore
        await db.collection('gameData').doc('tickets').update({
            winningTicket: ticketNumber,
            winnerAnnouncedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // If the winning ticket was purchased, reward the winner
        if (ticketsData.soldTickets && ticketsData.soldTickets[ticketNumber]) {
            const winnerInfo = ticketsData.soldTickets[ticketNumber];
            
            // Give bonus coins to winner
            await db.collection('users').doc(winnerInfo.userId).update({
                coins: firebase.firestore.FieldValue.increment(1000), // Winner bonus
                isWinner: true,
                winningTicket: ticketNumber
            });
            
            showMessage(`विजेता घोषित! टिकट ${ticketNumber.toString().padStart(5, '0')} - ${winnerInfo.userName}`, 'success');
        } else {
            showMessage(`विजेता टिकट घोषित: ${ticketNumber.toString().padStart(5, '0')} (अभी तक नहीं बेचा गया)`, 'info');
        }
        
        // Update UI
        showWinnerAnnouncement();
        displayTickets(currentPage);
        
        // Clear input
        document.getElementById('winningTicketNumber').value = '';
        
    } catch (error) {
        console.error('Error announcing winner:', error);
        showMessage('विजेता घोषित करने में त्रुटि', 'error');
    }
}

// Reset game
async function resetGame() {
    if (!isAdmin) {
        showMessage('केवल एडमिन ही गेम रीसेट कर सकते हैं', 'error');
        return;
    }
    
    const confirmReset = confirm('क्या आप वाकई सभी टिकट्स रीसेट करना चाहते हैं? यह सभी खरीदे गए टिकट्स को हटा देगा।');
    
    if (!confirmReset) {
        return;
    }
    
    try {
        // Reset tickets data
        ticketsData = {
            soldTickets: {},
            winningTicket: null,
            gameActive: true,
            resetAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        winningTicket = null;
        
        // Save to Firestore
        await db.collection('gameData').doc('tickets').set(ticketsData);
        
        // Reset all users' tickets
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();
        
        usersSnapshot.forEach((doc) => {
            batch.update(doc.ref, {
                tickets: [],
                isWinner: false,
                winningTicket: firebase.firestore.FieldValue.delete()
            });
        });
        
        await batch.commit();
        
        // Update UI
        document.getElementById('winnerAnnouncement').style.display = 'none';
        displayTickets(currentPage);
        
        showMessage('गेम सफलतापूर्वक रीसेट हो गया!', 'success');
        
    } catch (error) {
        console.error('Error resetting game:', error);
        showMessage('गेम रीसेट करने में त्रुटि', 'error');
    }
}

// View all users
async function viewAllUsers() {
    if (!isAdmin) {
        showMessage('केवल एडमिन ही यूजर्स देख सकते हैं', 'error');
        return;
    }
    
    try {
        const usersSnapshot = await db.collection('users').get();
        allUsers = [];
        
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            allUsers.push({
                id: doc.id,
                ...userData
            });
        });
        
        displayUsersModal();
        
    } catch (error) {
        console.error('Error fetching users:', error);
        showMessage('यूजर्स लोड करने में त्रुटि', 'error');
    }
}

// Display users in modal
function displayUsersModal() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal" id="usersModal" style="display: block;">
            <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
                <span class="close" onclick="closeModal('usersModal')">&times;</span>
                <h2>सभी यूजर्स</h2>
                <div class="users-list">
                    ${allUsers.map(user => `
                        <div class="user-item" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                                <div>
                                    <strong>${user.displayName || 'नाम नहीं'}</strong><br>
                                    <small>${user.email}</small><br>
                                    <span style="color: #667eea;">कॉइन्स: ${user.coins || 0}</span><br>
                                    <span style="color: #28a745;">टिकट्स: ${(user.tickets || []).length}</span>
                                    ${user.isWinner ? '<br><span style="color: #ffd700; font-weight: bold;">🏆 विजेता</span>' : ''}
                                </div>
                                <div>
                                    <button class="btn-secondary" onclick="addCoinsToUser('${user.id}', 100)" style="margin: 2px;">+100 कॉइन्स</button>
                                    <button class="btn-danger" onclick="removeCoinsFromUser('${user.id}', 50)" style="margin: 2px;">-50 कॉइन्स</button>
                                </div>
                            </div>
                            ${user.tickets && user.tickets.length > 0 ? `
                                <div style="margin-top: 10px;">
                                    <small><strong>खरीदे गए टिकट्स:</strong> ${user.tickets.map(t => t.toString().padStart(5, '0')).join(', ')}</small>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('usersModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Add coins to user (Admin function)
async function addCoinsToUser(userId, amount) {
    if (!isAdmin) {
        showMessage('केवल एडमिन ही कॉइन्स जोड़ सकते हैं', 'error');
        return;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            coins: firebase.firestore.FieldValue.increment(amount)
        });
        
        showMessage(`${amount} कॉइन्स जोड़े गए`, 'success');
        
        // Refresh users list
        viewAllUsers();
        
    } catch (error) {
        console.error('Error adding coins:', error);
        showMessage('कॉइन्स जोड़ने में त्रुटि', 'error');
    }
}

// Remove coins from user (Admin function)
async function removeCoinsFromUser(userId, amount) {
    if (!isAdmin) {
        showMessage('केवल एडमिन ही कॉइन्स हटा सकते हैं', 'error');
        return;
    }
    
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const currentCoins = userData.coins || 0;
            const newCoins = Math.max(0, currentCoins - amount); // Don't go below 0
            
            await db.collection('users').doc(userId).update({
                coins: newCoins
            });
            
            showMessage(`${amount} कॉइन्स हटाए गए`, 'success');
            
            // Refresh users list
            viewAllUsers();
        }
        
    } catch (error) {
        console.error('Error removing coins:', error);
        showMessage('कॉइन्स हटाने में त्रुटि', 'error');
    }
}

// Get game statistics
async function getGameStats() {
    if (!isAdmin) return;
    
    try {
        const usersSnapshot = await db.collection('users').get();
        let totalUsers = 0;
        let totalCoinsInCirculation = 0;
        let totalTicketsSold = 0;
        
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            totalUsers++;
            totalCoinsInCirculation += userData.coins || 0;
            totalTicketsSold += (userData.tickets || []).length;
        });
        
        const stats = {
            totalUsers,
            totalCoinsInCirculation,
            totalTicketsSold,
            totalRevenue: totalTicketsSold * TICKET_PRICE,
            availableTickets: TOTAL_TICKETS - totalTicketsSold
        };
        
        displayGameStats(stats);
        
    } catch (error) {
        console.error('Error getting game stats:', error);
    }
}

// Display game statistics
function displayGameStats(stats) {
    const statsHTML = `
        <div class="game-stats" style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin: 20px 0;">
            <h3>गेम आंकड़े</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                    <strong style="color: #667eea;">${stats.totalUsers}</strong><br>
                    <small>कुल यूजर्स</small>
                </div>
                <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                    <strong style="color: #28a745;">${stats.totalTicketsSold}</strong><br>
                    <small>बेचे गए टिकट्स</small>
                </div>
                <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                    <strong style="color: #ffd700;">${stats.totalCoinsInCirculation}</strong><br>
                    <small>कुल कॉइन्स</small>
                </div>
                <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                    <strong style="color: #dc3545;">${stats.availableTickets}</strong><br>
                    <small>उपलब्ध टिकट्स</small>
                </div>
            </div>
        </div>
    `;
    
    // Add stats to admin section
    const adminSection = document.getElementById('adminSection');
    const existingStats = adminSection.querySelector('.game-stats');
    if (existingStats) {
        existingStats.remove();
    }
    
    adminSection.querySelector('.container').insertAdjacentHTML('afterbegin', statsHTML);
}

// Initialize admin panel when tab is shown
function initializeAdminPanel() {
    if (isAdmin) {
        getGameStats();
    }
}

// Auto-refresh stats every 30 seconds for admin
setInterval(() => {
    if (isAdmin && document.getElementById('adminSection').style.display !== 'none') {
        getGameStats();
    }
}, 30000);

