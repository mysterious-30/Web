const correctCode = "1234"; // Correct password
let countdown;
let signalDisplay = document.getElementById('signalDisplay');
let directionBtn = document.getElementById('direction');
let timerDisplay = document.getElementById('timer');
let signalCache = new Map(); // Store signals for each interval

// Asset pairs (base list, no _otc or (OTC) in name)
const assetPairs = [
    { value: 'AUDCAD', label: 'AUD/CAD' },
    { value: 'AUDCHF', label: 'AUD/CHF' },
    { value: 'AUDJPY', label: 'AUD/JPY' },
    { value: 'AUDNZD', label: 'AUD/NZD' },
    { value: 'AUDUSD', label: 'AUD/USD' },
    { value: 'AXP', label: 'American Express' },
    { value: 'BA', label: 'Boeing Company' },
    { value: 'BRLUSD', label: 'USD/BRL' },
    { value: 'BTCUSD', label: 'Bitcoin' },
    { value: 'CADCHF', label: 'CAD/CHF' },
    { value: 'CADJPY', label: 'CAD/JPY' },
    { value: 'CHFJPY', label: 'CHF/JPY' },
    { value: 'EURAUD', label: 'EUR/AUD' },
    { value: 'EURCAD', label: 'EUR/CAD' },
    { value: 'EURCHF', label: 'EUR/CHF' },
    { value: 'EURGBP', label: 'EUR/GBP' },
    { value: 'EURJPY', label: 'EUR/JPY' },
    { value: 'EURNZD', label: 'EUR/NZD' },
    { value: 'EURSGD', label: 'EUR/SGD' },
    { value: 'EURUSD', label: 'EUR/USD' },
    { value: 'FB', label: 'FACEBOOK INC' },
    { value: 'GBPAUD', label: 'GBP/AUD' },
    { value: 'GBPCAD', label: 'GBP/CAD' },
    { value: 'GBPCHF', label: 'GBP/CHF' },
    { value: 'GBPJPY', label: 'GBP/JPY' },
    { value: 'GBPNZD', label: 'GBP/NZD' },
    { value: 'GBPUSD', label: 'GBP/USD' },
    { value: 'INTC', label: 'Intel' },
    { value: 'JNJ', label: 'Johnson & Johnson' },
    { value: 'JPXJPY', label: 'Nikkei 225' },
    { value: 'MCD', label: "McDonald's" },
    { value: 'MSFT', label: 'Microsoft' },
    { value: 'NZDCAD', label: 'NZD/CAD' },
    { value: 'NZDCHF', label: 'NZD/CHF' },
    { value: 'NZDJPY', label: 'NZD/JPY' },
    { value: 'PFE', label: 'Pfizer Inc' },
    { value: 'UKBrent', label: 'UKBrent' },
    { value: 'USCrude', label: 'USCrude' },
    { value: 'USDARS', label: 'USD/ARS' },
    { value: 'USDBDT', label: 'USD/BDT' },
    { value: 'USDCAD', label: 'USD/CAD' },
    { value: 'USDCHF', label: 'USD/CHF' },
    { value: 'USDCOP', label: 'USD/COP' },
    { value: 'USDDZD', label: 'USD/DZD' },
    { value: 'USDEGP', label: 'USD/EGP' },
    { value: 'USDIDR', label: 'USD/IDR' },
    { value: 'USDINR', label: 'USD/INR' },
    { value: 'USDJPY', label: 'USD/JPY' },
    { value: 'USDMXN', label: 'USD/MXN' },
    { value: 'USDNGN', label: 'USD/NGN' },
    { value: 'USDPHP', label: 'USD/PHP' },
    { value: 'USDPKR', label: 'USD/PKR' },
    { value: 'USDTRY', label: 'USD/TRY' },
    { value: 'XAGUSD', label: 'Silver' },
    { value: 'XAUUSD', label: 'Gold' },
    { value: 'USDZAR', label: 'USD/ZAR' },
];

function isWeekend() {
    const today = new Date().getDay();
    return today === 0 || today === 6; // Sunday=0, Saturday=6
}

function populateAssetDropdown() {
    const assetSelect = document.getElementById('asset-select');
    // Preserve current selection
    const currentValue = assetSelect.value;
    // Remove all options except the first (placeholder)
    assetSelect.options.length = 1;
    const weekend = isWeekend();
    let found = false;
    assetPairs.forEach(pair => {
        const option = document.createElement('option');
        if (weekend) {
            option.value = pair.value + '_otc';
            option.textContent = pair.label + ' (OTC)';
        } else {
            option.value = pair.value;
            option.textContent = pair.label;
        }
        if (option.value === currentValue) {
            option.selected = true;
            found = true;
        }
        assetSelect.appendChild(option);
    });
    // If the previous value is not found, keep the placeholder selected
    if (!found) {
        assetSelect.selectedIndex = 0;
    }
}

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

    populateAssetDropdown();

    // Repopulate asset dropdown on focus or click (handles day change without reload)
    const assetSelect = document.getElementById('asset-select');
    assetSelect.addEventListener('focus', populateAssetDropdown);
    assetSelect.addEventListener('click', populateAssetDropdown);
});

// Validate form before enabling get signal button
function validateForm() {
    const selectedBroker = document.getElementById('broker-select').value;
    const selectedAsset = document.getElementById('asset-select').value;
    const selectedTime = document.getElementById('time-select').value;
    const getSignalBtn = document.querySelector('.get-signal');

    getSignalBtn.disabled = !(selectedBroker && selectedAsset && selectedTime);
} 