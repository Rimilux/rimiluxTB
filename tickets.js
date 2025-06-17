// Ticket System
const TOTAL_TICKETS = 10000;
const TICKETS_PER_PAGE = 100;
const TICKET_PRICE = 100;
const TOTAL_PAGES = Math.ceil(TOTAL_TICKETS / TICKETS_PER_PAGE);

let currentPage = 1;
let ticketsData = {};
let winningTicket = null;

// Initialize tickets system
async function initializeTickets() {
    try {
        // Load tickets data from Firestore
        const ticketsDoc = await db.collection('gameData').doc('tickets').get();
        if (ticketsDoc.exists) {
            ticketsData = ticketsDoc.data();
        } else {
            // Initialize empty tickets data
            ticketsData = {
                soldTickets: {},
                winningTicket: null,
                gameActive: true
            };
            await saveTicketsData();
        }
        
        winningTicket = ticketsData.winningTicket;
        generatePageButtons();
        displayTickets(currentPage);
        
        if (winningTicket) {
            showWinnerAnnouncement();
        }
    } catch (error) {
        console.error('Error initializing tickets:', error);
        showMessage('टिकट्स लोड करने में त्रुटि', 'error');
    }
}

// Generate page buttons
function generatePageButtons() {
    const pageButtonsContainer = document.getElementById('pageButtons');
    pageButtonsContainer.innerHTML = '';
    
    for (let i = 1; i <= TOTAL_PAGES; i++) {
        const button = document.createElement('button');
        button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        button.textContent = `पेज ${i}`;
        button.onclick = () => changePage(i);
        pageButtonsContainer.appendChild(button);
    }
}

// Change page
function changePage(page) {
    currentPage = page;
    generatePageButtons();
    displayTickets(page);
}

// Display tickets for current page
function displayTickets(page) {
    const ticketsGrid = document.getElementById('ticketsGrid');
    const currentPageTitle = document.getElementById('currentPageTitle');
    
    const startTicket = (page - 1) * TICKETS_PER_PAGE + 1;
    const endTicket = Math.min(page * TICKETS_PER_PAGE, TOTAL_TICKETS);
    
    currentPageTitle.textContent = `पेज ${page} (टिकट ${startTicket}-${endTicket})`;
    
    ticketsGrid.innerHTML = '';
    
    for (let i = startTicket; i <= endTicket; i++) {
        const ticket = createTicketElement(i);
        ticketsGrid.appendChild(ticket);
    }
}

// Create ticket element
function createTicketElement(ticketNumber) {
    const ticket = document.createElement('div');
    ticket.className = 'ticket';
    ticket.textContent = ticketNumber.toString().padStart(5, '0');
    
    const ticketStatus = getTicketStatus(ticketNumber);
    ticket.classList.add(ticketStatus.class);
    
    if (ticketStatus.class === 'available') {
        ticket.onclick = () => purchaseTicket(ticketNumber);
        ticket.title = 'खरीदने के लिए क्लिक करें';
    } else if (ticketStatus.class === 'purchased') {
        ticket.title = 'आपका टिकट';
    } else if (ticketStatus.class === 'sold') {
        ticket.title = 'बेचा गया';
    } else if (ticketStatus.class === 'winning') {
        ticket.title = 'जीतने वाला टिकट!';
    }
    
    return ticket;
}

// Get ticket status
function getTicketStatus(ticketNumber) {
    if (winningTicket === ticketNumber) {
        return { class: 'winning', status: 'winning' };
    }
    
    if (ticketsData.soldTickets && ticketsData.soldTickets[ticketNumber]) {
        const ticketInfo = ticketsData.soldTickets[ticketNumber];
        if (currentUser && ticketInfo.userId === currentUser.uid) {
            return { class: 'purchased', status: 'purchased' };
        } else {
            return { class: 'sold', status: 'sold' };
        }
    }
    
    return { class: 'available', status: 'available' };
}

// Purchase ticket
async function purchaseTicket(ticketNumber) {
    if (!currentUser) {
        showMessage('कृपया पहले लॉगिन करें', 'error');
        return;
    }
    
    // Check if user has enough coins
    const userCoins = parseInt(document.getElementById('userCoins').textContent);
    if (userCoins < TICKET_PRICE) {
        showMessage('पर्याप्त कॉइन्स नहीं हैं', 'error');
        return;
    }
    
    // Check if ticket is already sold
    if (ticketsData.soldTickets && ticketsData.soldTickets[ticketNumber]) {
        showMessage('यह टिकट पहले से बेचा गया है', 'error');
        return;
    }
    
    try {
        // Start transaction
        await db.runTransaction(async (transaction) => {
            const userRef = db.collection('users').doc(currentUser.uid);
            const ticketsRef = db.collection('gameData').doc('tickets');
            
            const userDoc = await transaction.get(userRef);
            const ticketsDoc = await transaction.get(ticketsRef);
            
            if (!userDoc.exists) {
                throw new Error('User document not found');
            }
            
            const userData = userDoc.data();
            if (userData.coins < TICKET_PRICE) {
                throw new Error('Insufficient coins');
            }
            
            const currentTicketsData = ticketsDoc.exists ? ticketsDoc.data() : { soldTickets: {} };
            
            // Check if ticket is still available
            if (currentTicketsData.soldTickets && currentTicketsData.soldTickets[ticketNumber]) {
                throw new Error('Ticket already sold');
            }
            
            // Update user coins and tickets
            const newUserTickets = userData.tickets || [];
            newUserTickets.push(ticketNumber);
            
            transaction.update(userRef, {
                coins: userData.coins - TICKET_PRICE,
                tickets: newUserTickets
            });
            
            // Update tickets data
            const newSoldTickets = currentTicketsData.soldTickets || {};
            newSoldTickets[ticketNumber] = {
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email,
                purchaseTime: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            transaction.set(ticketsRef, {
                ...currentTicketsData,
                soldTickets: newSoldTickets
            });
        });
        
        // Update local data
        if (!ticketsData.soldTickets) {
            ticketsData.soldTickets = {};
        }
        ticketsData.soldTickets[ticketNumber] = {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            purchaseTime: new Date()
        };
        
        // Update UI
        updateUserCoins(-TICKET_PRICE);
        displayTickets(currentPage);
        showMessage(`टिकट ${ticketNumber.toString().padStart(5, '0')} सफलतापूर्वक खरीदा गया!`, 'success');
        
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        if (error.message === 'Insufficient coins') {
            showMessage('पर्याप्त कॉइन्स नहीं हैं', 'error');
        } else if (error.message === 'Ticket already sold') {
            showMessage('यह टिकट पहले से बेचा गया है', 'error');
        } else {
            showMessage('टिकट खरीदने में त्रुटि', 'error');
        }
    }
}

// Save tickets data to Firestore
async function saveTicketsData() {
    try {
        await db.collection('gameData').doc('tickets').set(ticketsData);
    } catch (error) {
        console.error('Error saving tickets data:', error);
    }
}

// Show winner announcement
function showWinnerAnnouncement() {
    if (!winningTicket) return;
    
    const announcement = document.getElementById('winnerAnnouncement');
    const winningTicketSpan = document.getElementById('winningTicket');
    const winnerNameSpan = document.getElementById('winnerName');
    
    winningTicketSpan.textContent = winningTicket.toString().padStart(5, '0');
    
    if (ticketsData.soldTickets && ticketsData.soldTickets[winningTicket]) {
        winnerNameSpan.textContent = ticketsData.soldTickets[winningTicket].userName;
    } else {
        winnerNameSpan.textContent = 'कोई नहीं (टिकट नहीं बेचा गया)';
    }
    
    announcement.style.display = 'block';
}

// Get user's purchased tickets
function getUserTickets() {
    if (!currentUser || !ticketsData.soldTickets) return [];
    
    const userTickets = [];
    for (const [ticketNumber, ticketInfo] of Object.entries(ticketsData.soldTickets)) {
        if (ticketInfo.userId === currentUser.uid) {
            userTickets.push(parseInt(ticketNumber));
        }
    }
    return userTickets;
}

// Show tab function
function showTab(tabName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected section and activate tab
    const selectedSection = document.getElementById(tabName + 'Section');
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    // Find and activate the clicked tab
    const clickedTab = Array.from(tabs).find(tab => 
        tab.textContent.includes(getTabText(tabName))
    );
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    // Initialize specific tab content
    if (tabName === 'tickets') {
        initializeTickets();
    } else if (tabName === 'game') {
        generateNewPuzzle();
    }
}

// Get tab text for different sections
function getTabText(tabName) {
    switch (tabName) {
        case 'tickets': return 'टिकट्स';
        case 'tasks': return 'टास्क';
        case 'game': return 'गेम';
        case 'admin': return 'एडमिन';
        default: return '';
    }
}

// Initialize tickets when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth state to be determined
    setTimeout(() => {
        if (currentUser) {
            initializeTickets();
        }
    }, 1000);
});

