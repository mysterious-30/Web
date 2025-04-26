const correctCode = "1234"; // Correct password
let countdown;
let signalDisplay = document.getElementById('signalDisplay');
let directionBtn = document.getElementById('direction');
let timerDisplay = document.getElementById('timer');
let signalCache = new Map(); // Store signals for each interval

// Initialize UTC time display
function initializeUTCTime() {
    updateUTCTime();
    setInterval(updateUTCTime, 1000);
}

// Update UTC+5:30 time display
function updateUTCTime() {
    const now = new Date();
    const utcTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = utcTime.getUTCHours().toString().padStart(2, '0');
    const minutes = utcTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = utcTime.getUTCSeconds().toString().padStart(2, '0');
    document.getElementById('utc-time').textContent = `UTC+5:30: ${hours}:${minutes}:${seconds}`;
}

// Check Code Function
function checkCode() {
    const userCode = document.getElementById("codeInput").value;
    const overlay = document.getElementById("overlay");
    const mainContent = document.getElementById("mainContent");

    if (userCode === correctCode) {
        overlay.style.display = "none";
        mainContent.style.display = "flex";
    } else {
        alert("Invalid code. Please try again.");
        document.getElementById("codeInput").value = "";
    }
}

// Calculate next signal time based on interval (millisecond-accurate, but display only MM:SS)
function calculateNextSignalTime(interval) {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ms = now.getMilliseconds();

    // Find the next interval minute mark
    let nextIntervalMinute = Math.ceil((minutes + (seconds > 0 || ms > 0 ? 1 : 0)) / interval) * interval;
    if (nextIntervalMinute >= 60) nextIntervalMinute = 0;

    // Set the next interval time
    const next = new Date(now);
    next.setMinutes(nextIntervalMinute, 0, 0);
    if (next <= now) next.setHours(next.getHours() + 1);

    // Return the difference in seconds (with decimals)
    return (next - now) / 1000;
}

// Get current interval window
function getCurrentIntervalWindow(interval) {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    return Math.floor(currentMinutes / interval) * interval;
}

// Generate random direction
function generateRandomDirection() {
    return Math.random() > 0.5 ? 'UP' : 'DOWN';
}

// Get signal direction for specific interval
function getSignalDirection(interval) {
    const currentWindow = getCurrentIntervalWindow(interval);
    const cacheKey = `${interval}-${currentWindow}`;
    
    // If we already have a signal for this interval and window, return it
    if (signalCache.has(cacheKey)) {
        return signalCache.get(cacheKey);
    }
    
    // Generate new random direction for this interval and window
    const direction = generateRandomDirection();
    signalCache.set(cacheKey, direction);
    return direction;
}

// Hide signal display
function hideSignalDisplay() {
    signalDisplay.style.display = 'none';
    clearInterval(countdown);
}

// Get Signal Logic
function getSignal() {
    const selectedBroker = document.getElementById('broker-select').value;
    const selectedAsset = document.getElementById('asset-select').value;
    const interval = parseInt(document.getElementById('time-select').value);

    if (!selectedBroker || !selectedAsset || !interval) {
        alert("Please select broker, asset, and interval first!");
        return;
    }

    // Show the signal display
    signalDisplay.style.display = 'flex';

    // Get direction based on interval
    const direction = getSignalDirection(interval);

    if (direction === 'UP') {
        directionBtn.innerText = 'UP';
        directionBtn.classList.add('green');
        directionBtn.classList.remove('red');
    } else {
        directionBtn.innerText = 'DOWN';
        directionBtn.classList.add('red');
        directionBtn.classList.remove('green');
    }

    startCountdown(interval);
}

// Start Countdown Timer
function startCountdown(interval) {
    clearInterval(countdown);
    
    function updateTimer() {
        const now = new Date();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        // Check if we've reached the target time
        if (currentMinutes % interval === 0 && currentSeconds === 0) {
            hideSignalDisplay();
            return;
        }
        // Calculate remaining time
        const remainingSeconds = calculateNextSignalTime(interval);
        timerDisplay.innerHTML = formatTime(remainingSeconds);
    }
    // Update immediately and then every 200ms for smooth countdown
    updateTimer();
    countdown = setInterval(updateTimer, 200);
}

// Format Countdown Time (show only MM:SS)
function formatTime(seconds) {
    const rounded = Math.ceil(seconds); // Always round UP so timer hits 00:00 at the right moment
    const minutes = Math.floor(rounded / 60);
    const secs = rounded % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Add event listeners for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add input event listener for code input
    document.getElementById('codeInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkCode();
        }
    });

    // Add change event listeners for selects
    document.getElementById('broker-select').addEventListener('change', validateForm);
    document.getElementById('asset-select').addEventListener('change', validateForm);
    document.getElementById('time-select').addEventListener('change', () => {
        validateForm();
        // Hide signal display when interval changes
        hideSignalDisplay();
    });
});

// Validate form before enabling get signal button
function validateForm() {
    const selectedBroker = document.getElementById('broker-select').value;
    const selectedAsset = document.getElementById('asset-select').value;
    const selectedTime = document.getElementById('time-select').value;
    const getSignalBtn = document.querySelector('.get-signal');

    getSignalBtn.disabled = !(selectedBroker && selectedAsset && selectedTime);
} 