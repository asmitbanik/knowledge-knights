document.addEventListener('DOMContentLoaded', function () {
    // Load the relevant data when each page loads
    if (document.getElementById('schedule-form')) loadSchedule();
    if (document.getElementById('resource-links')) loadResources();
    if (document.getElementById('chat-container')) loadChatMessages();
    if (document.getElementById('notes-container')) loadNotes();
    if (document.getElementById('upcoming-meetings')) loadUpcomingMeetings();

    // Event listeners for forms
    if (document.getElementById('schedule-form')) {
        document.getElementById('schedule-form').addEventListener('submit', saveSchedule);
    }
    if (document.getElementById('signin-form')) {
        document.getElementById('signin-form').addEventListener('submit', signIn);
    }
    if (document.getElementById('signup-form')) {
        document.getElementById('signup-form').addEventListener('submit', signUp);
    }
    if (document.getElementById('chat-form')) {
        document.getElementById('chat-form').addEventListener('submit', saveChatMessage);
    }
    if (document.getElementById('save-notes')) {
        document.getElementById('save-notes').addEventListener('click', saveNotes);
    }

    // Event listeners for adding resources
    document.getElementById('add-file-btn').addEventListener('click', addFile);
    document.getElementById('add-url-btn').addEventListener('click', addURL);

    // Auto-save notes as user types
    const notesInput = document.getElementById('notes-input');
    if (notesInput) {
        notesInput.addEventListener('input', autoSaveNotes);
    }
});

// Functions to handle scheduling
function loadSchedule() {
    const scheduledSessions = JSON.parse(localStorage.getItem('scheduledSessions')) || [];
    const scheduledContainer = document.getElementById('scheduled-sessions');
    scheduledContainer.innerHTML = '';

    scheduledSessions.forEach(session => {
        const div = document.createElement('div');
        div.textContent = `${session.date}: ${session.topic}`;
        scheduledContainer.appendChild(div);
    });
}

function saveSchedule(e) {
    e.preventDefault();
    const date = document.getElementById('session-date').value;
    const topic = document.getElementById('session-topic').value;

    const scheduledSessions = JSON.parse(localStorage.getItem('scheduledSessions')) || [];
    scheduledSessions.push({ date, topic });
    localStorage.setItem('scheduledSessions', JSON.stringify(scheduledSessions));
    loadSchedule();
    loadUpcomingMeetings(); // Update home page's upcoming meetings

    // Clear the form
    document.getElementById('schedule-form').reset();
}

// Function to load upcoming meetings on the home page with countdown timers
function loadUpcomingMeetings() {
    const scheduledSessions = JSON.parse(localStorage.getItem('scheduledSessions')) || [];
    const upcomingMeetingsContainer = document.getElementById('upcoming-meetings');
    upcomingMeetingsContainer.innerHTML = '';

    scheduledSessions.forEach(session => {
        const div = document.createElement('div');
        div.classList.add('meeting');
        div.innerHTML = `
            <p>${session.date}: ${session.topic}</p>
            <p id="countdown-${session.date.replace(/[^a-zA-Z0-9]/g, '')}"></p>
        `;
        upcomingMeetingsContainer.appendChild(div);

        // Start the countdown
        startCountdown(session.date, session.topic);
    });
}

function startCountdown(dateStr, topic) {
    const countdownElementId = `countdown-${dateStr.replace(/[^a-zA-Z0-9]/g, '')}`;
    const countdownElement = document.getElementById(countdownElementId);
    const eventDate = new Date(dateStr).getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = eventDate - now;

        // Calculate days, hours, minutes, and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result with span elements for styling
        countdownElement.innerHTML = `
            <span>${days}d</span>
            <span>${hours}h</span>
            <span>${minutes}m</span>
            <span>${seconds}s</span>
        `;

        // If the countdown is over, display a message
        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownElement.textContent = "Meeting is in progress!";
        }
    };

    // Update the countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Run the countdown immediately
}

// Functions to handle resources
function loadResources() {
    const resources = JSON.parse(localStorage.getItem('resources')) || [];
    const resourceContainer = document.getElementById('resource-links');
    resourceContainer.innerHTML = '';

    resources.forEach(resource => {
        const link = document.createElement('a');
        link.href = resource.url;
        link.textContent = resource.name;
        link.target = '_blank';
        resourceContainer.appendChild(link);
        resourceContainer.appendChild(document.createElement('br'));
    });
}

function addFile() {
    const fileInput = document.getElementById('file-input');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileUrl = URL.createObjectURL(file);
        const resources = JSON.parse(localStorage.getItem('resources')) || [];
        resources.push({ name: file.name, url: fileUrl });
        localStorage.setItem('resources', JSON.stringify(resources));
        loadResources();
        fileInput.value = ''; // Clear the input
    }
}

function addURL() {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    if (url) {
        const resources = JSON.parse(localStorage.getItem('resources')) || [];
        resources.push({ name: url, url: url });
        localStorage.setItem('resources', JSON.stringify(resources));
        loadResources();
        urlInput.value = ''; // Clear the input
    }
}

// Functions to handle chat messages
function loadChatMessages() {
    const chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';

    chatMessages.forEach(msg => {
        const div = document.createElement('div');
        div.classList.add('chat-message');
        div.innerHTML = `
            <img src="${msg.avatar}" alt="Avatar" class="avatar">
            <div>
                <strong>${msg.sender}</strong>
                <span class="timestamp">${msg.timestamp}</span>
                <p>${msg.message}</p>
            </div>
        `;
        chatContainer.appendChild(div);
    });
}

function saveChatMessage(e) {
    e.preventDefault();
    const message = document.getElementById('chat-message').value;
    const sender = prompt("Enter your name:");
    const gender = prompt("Enter your gender (Male/Female):").toLowerCase();
    const avatarUrl = `https://api.multiavatar.com/${sender}${gender === 'female' ? '-female' : ''}.png`;
    const timestamp = new Date().toLocaleString();

    const chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    chatMessages.push({ sender, message, timestamp, avatar: avatarUrl });
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    loadChatMessages();

    // Clear the chat input
    document.getElementById('chat-form').reset();
}

// Functions to handle notes
function loadNotes() {
    const notes = localStorage.getItem('notes') || '';
    const notesInput = document.getElementById('notes-input');
    if (notesInput) {
        notesInput.value = notes;
    }
}

const textarea = document.getElementById('notes-input');

window.addEventListener('load', loadNotes);

function autoSaveNotes() {
    // const notes = document.getElementById('notes-input').value;
    console.log("Saving notes");
    localStorage.setItem('notes', textarea.value);
}

textarea.addEventListener('input', autoSaveNotes);
