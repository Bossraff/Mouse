let timer;
let totalMilliseconds = 0;
let totalTime = 0; // Total time in milliseconds
let isRunning = false;
let logEntries = [];
let interval = 100;
let autoPause = false;
let lastUpdateTime = Date.now(); // Track the last time the timer was updated
let selectedDay = localStorage.getItem('selectedDay') || '';
let selectedStatus = localStorage.getItem('selectedStatus') || '';
let lastPausedMilliseconds = 0; // Tracks the last paused time to avoid double adding
const logEntriesStorageKey = `logEntries-${selectedDay}`;

// Initialize the page
window.onload = function () {
    loadTimer();
    loadLogs();
    loadTotalTime();
    document.getElementById('dayDropdown').value = selectedDay;
    document.getElementById('statusDropdown').value = selectedStatus; // Load the saved status
    updateCurrentTime();
    checkDropdowns(); // Ensure button state is correct on load
};

// Function to check if both dropdowns are selected
function checkDropdowns() {
    const startBtn = document.getElementById('startBtn');
    const daySelected = document.getElementById('dayDropdown').value;
    const statusSelected = document.getElementById('statusDropdown').value;

    // Enable the start button if both dropdowns have values
    if (daySelected && statusSelected) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

// Disable the start button initially
document.getElementById('startBtn').disabled = true;

// Event listeners to check dropdowns
document.getElementById('dayDropdown').addEventListener('change', checkDropdowns);
document.getElementById('statusDropdown').addEventListener('change', checkDropdowns);

// Reset dropdown selections
function resetDropdowns() {
    document.getElementById('dayDropdown').value = '';
    document.getElementById('statusDropdown').value = '';
    localStorage.removeItem('selectedDay');
    localStorage.removeItem('selectedStatus');
    checkDropdowns(); // Update the button state
}

// Start the timer
document.getElementById('startBtn').addEventListener('click', function () {
    selectedDay = document.getElementById('dayDropdown').value;
    selectedStatus = document.getElementById('statusDropdown').value;

    if (selectedDay && selectedStatus) { // Require day and status to be selected
        if (!isRunning) {
            isRunning = true;
            logStartEvent();
            lastUpdateTime = Date.now(); // Set the start time
            timer = setInterval(updateTimer, interval);
        }
    } else {
        alert('Please select a day and status before starting the timer.');
    }
});

// Pause the timer and add time to total hours
document.getElementById('pauseBtn').addEventListener('click', function () {
    if (isRunning) {
        isRunning = false;
        clearInterval(timer);
        logPauseEvent();
        addTotalTime(totalMilliseconds - lastPausedMilliseconds); // Only add the time since the last pause
        lastPausedMilliseconds = totalMilliseconds; // Update the last paused time
    }
});

// WIP button functionality
document.getElementById('wipBtn').addEventListener('click', function () {
    logWIPEvent();
    saveScreenshot();
});

// **Done button functionality: Logs the Done event**
document.getElementById('doneBtn').addEventListener('click', function () {
    if (confirm("Are you sure you want to reset?")) {
    logDoneEvent(); // Log the Done event
    doneFunction();
    }
});

// **Reset button functionality: Resets everything**
// **Reset button functionality: Confirms three times before resetting everything**
document.getElementById('resetBtn').addEventListener('click', function () {
    if (confirm("Are you sure you want to reset?")) {
        if (confirm("This will erase all data. Are you really sure?")) {
            if (confirm("Last chance to cancel. Do you still want to reset?")) {
                resetAll(); // Calls the resetAll function
                resetDropdowns(); // Reset dropdowns as well
            }
        }
    }
});

// Update current time every second
setInterval(updateCurrentTime, 1000);

// Update the timer display
function updateTimer() {
    let now = Date.now(); // Current time
    let elapsed = now - lastUpdateTime; // Time since last update
    totalMilliseconds += elapsed; // Add the elapsed time
    lastUpdateTime = now; // Update the last time the function was called
    displayTime(totalMilliseconds);
}


// Display the time
function displayTime(milliseconds) {
    let hours = Math.floor(milliseconds / (1000 * 60 * 60));
    let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    let tenths = Math.floor((milliseconds % 1000) / 100);
    document.getElementById('timerDisplay').textContent = 
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${tenths}`;
}

// Pad single digits with leading zero
function pad(num) {
    return num < 10 ? '0' + num : num;
}

// Log the start event
function logStartEvent() {
    let logEntry = `${selectedDay} ${selectedStatus} STARTED: ${getCurrentTimeString()}`;
    logEntries.unshift(logEntry); // Add to the beginning of the array
    saveLogs();
    displayLogs();
}

// Log the pause event
function logPauseEvent() {
    let logEntry = `${selectedDay} ${selectedStatus} PAUSED: ${getCurrentTimeString()}`;
    logEntries.unshift(logEntry); // Add to the beginning of the array
    saveLogs();
    displayLogs();
}

// Log the WIP event
function logWIPEvent() {
    let logEntry = `${selectedDay} ${selectedStatus} WIP: ${getCurrentTimeString()} - ${document.getElementById('timerDisplay').textContent}`;
    logEntries.unshift(logEntry); // Add to the beginning of the array
    saveLogs();
    displayLogs();
}

// **Log the Done event**
function logDoneEvent() {
    let logEntry = `${selectedDay} ${selectedStatus} DONE: ${getCurrentTimeString()} - Total Time: ${formatTotalTime(totalMilliseconds)}`;
    logEntries.unshift(logEntry); // Add to the beginning of the array
    saveLogs();
    displayLogs();
}

// Get current time as a formatted string
function getCurrentTimeString() {
    let now = new Date();
    return now.toLocaleTimeString();
}

// Save the log entries to local storage
function saveLogs() {
    localStorage.setItem(logEntriesStorageKey, JSON.stringify(logEntries));
}

// Load the log entries from local storage
function loadLogs() {
    let savedLogs = JSON.parse(localStorage.getItem(logEntriesStorageKey));
    if (savedLogs) {
        logEntries = savedLogs;
        displayLogs();
    }
}

// Display the log entries
function displayLogs() {
    let logDiv = document.getElementById('logEntries');
    logDiv.innerHTML = ''; // Clear existing logs
    logEntries.forEach(entry => {
        let p = document.createElement('p');
        p.textContent = entry;
        logDiv.appendChild(p);
    });
}

// Add time to total time
function addTotalTime(milliseconds) {
    totalTime += milliseconds;
    localStorage.setItem(`totalTime-${selectedDay}`, totalTime);
    displayTotalTime();
}



// Display total time spent
function displayTotalTime() {
    document.getElementById('totalHours').textContent = 
        `TOTAL HOURS SPENT ON THE DAY ${formatTotalTime(totalTime)}`;
}

// Format total time
function formatTotalTime(milliseconds) {
    let hours = Math.floor(milliseconds / (1000 * 60 * 60));
    let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Update current time display
function updateCurrentTime() {
    let now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleString();
}

// Save timer state to local storage
function saveTimer() {
    localStorage.setItem('timerState', JSON.stringify({
        totalMilliseconds: totalMilliseconds,
        isRunning: isRunning
    }));
}

// Load timer state from local storage
function loadTimer() {
    let savedState = JSON.parse(localStorage.getItem('timerState'));
    if (savedState) {
        totalMilliseconds = savedState.totalMilliseconds;
        isRunning = savedState.isRunning;
        if (isRunning) {
            timer = setInterval(updateTimer, interval);
        }
        displayTime(totalMilliseconds);
    }
}

// Save total time to local storage
function loadTotalTime() {
    let savedTime = localStorage.getItem(`totalTime-${selectedDay}`);
    if (savedTime) {
        totalTime = parseInt(savedTime);
        displayTotalTime();
    }
}

// Reset all data
function resetAll() {
    clearInterval(timer);
    timer = null;
    totalMilliseconds = 0;
    lastPausedMilliseconds = 0;
    totalTime = 0;
    isRunning = false;
    logEntries = [];
    localStorage.removeItem('timerState');
    localStorage.removeItem(logEntriesStorageKey);
    localStorage.removeItem(`totalTime-${selectedDay}`);
    document.getElementById('timerDisplay').textContent = '00:00:00.0';
    displayTotalTime();
    displayLogs();
}




function doneFunction() {
 if (isRunning) {
        isRunning = false;
        clearInterval(timer);
        addTotalTime(totalMilliseconds - lastPausedMilliseconds); // Add time since last pause
    }

    logDoneEvent(); // Log the Done event with the total time
    totalMilliseconds = 0; // Reset the timer display
    lastPausedMilliseconds = 0; // Reset the last paused time
    document.getElementById('timerDisplay').textContent = '00:00:00.0';
    displayTotalTime(); // Update the total time display
    displayLogs(); // Display updated logs
}

// Save screenshot of the entire timer section including timer, log entries, and total hours
function saveScreenshot() {
    const container = document.querySelector('.container'); // Adjust this selector as needed

    html2canvas(container, {
        scale: 2 // Increase scale if a higher resolution screenshot is needed
    }).then(canvas => {
        let imgData = canvas.toDataURL('image/png');
        let a = document.createElement('a');
        a.href = imgData;
        a.download = 'timer-screenshot.png';
        a.click();
    });
}


// Save the current timer state before closing or refreshing the page
window.addEventListener('beforeunload', function () {
    saveTimer();
});

// Event listener for day dropdown change
document.getElementById('dayDropdown').addEventListener('change', function () {
    selectedDay = this.value;
    localStorage.setItem('selectedDay', selectedDay);
    checkDropdowns(); // Check dropdowns state
    loadTimer();
    loadLogs();
    loadTotalTime();
});

// Event listener for status dropdown change
document.getElementById('statusDropdown').addEventListener('change', function () {
    selectedStatus = this.value;
    localStorage.setItem('selectedStatus', selectedStatus);
    checkDropdowns(); // Check dropdowns state
});

// Event listener for settings button click
document.getElementById('settingsBtn').addEventListener('click', function () {
    document.getElementById('settingsModal').style.display = 'block';
});

// Event listener for closing the settings modal
document.querySelector('.close').addEventListener('click', function () {
    document.getElementById('settingsModal').style.display = 'none';
});






// terms.js
window.onload = function() {
    const termsModal = document.getElementById('termsModal');
    const exitModal = document.querySelector('.terms-modal .exit');
    const agreeBtn = document.getElementById('agreeBtn');
    const termsCheckbox = document.getElementById('termsCheckbox');
    const appContainer = document.getElementById('app');

    // Show the terms modal
    termsModal.style.display = 'block';

    // Check if the user has already agreed
    if (localStorage.getItem('termsAgreed')) {
        termsModal.style.display = 'none';
        appContainer.style.display = 'block';
    }

    // Enable the agree button when the checkbox is checked
    termsCheckbox.addEventListener('change', function() {
        agreeBtn.disabled = !termsCheckbox.checked;
    });

    // Handle the agree button click
    agreeBtn.addEventListener('click', function() {
        localStorage.setItem('termsAgreed', 'true');
        termsModal.style.display = 'none';
        appContainer.style.display = 'block';
    });

    // Handle the exit button click
    exitModal.addEventListener('click', function() {
        termsModal.style.display = 'none';
    });

    // Ensure that the app container is hidden until the user agrees
    appContainer.style.display = 'none';
};







// Disable right-click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Disable text selection
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});

// Disable key combinations like F12 and Ctrl+Shift+I (common shortcuts for dev tools)
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || 
        (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
    }
});





window.addEventListener('DOMContentLoaded', function() {
    // Automatically fade out and remove the announcement after 5 seconds
    setTimeout(function() {
        var announcement = document.getElementById('update-announcement');
        announcement.classList.add('fade-out');
    }, 8000);
});
