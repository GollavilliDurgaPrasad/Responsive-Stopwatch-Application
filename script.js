/**
 * Stopwatch class that handles the core timer functionality
 */
class Stopwatch {
  constructor() {
    this.startTime = 0;
    this.elapsedTime = 0;
    this.running = false;
    this.intervalId = null;
    this.laps = [];
    this.lastLapTime = 0;
  }

  start() {
    if (!this.running) {
      this.startTime = Date.now() - this.elapsedTime;
      this.running = true;
      this.intervalId = setInterval(() => this.updateTime(), 10);
    }
  }

  pause() {
    if (this.running) {
      clearInterval(this.intervalId);
      this.running = false;
    }
  }

  reset() {
    this.pause();
    this.elapsedTime = 0;
    this.laps = [];
    this.lastLapTime = 0;
    this.updateDisplay();
  }

  lap() {
    if (this.running) {
      const lapTime = this.elapsedTime;
      const lapDuration = lapTime - this.lastLapTime;
      this.laps.push({
        number: this.laps.length + 1,
        totalTime: lapTime,
        lapTime: lapDuration
      });
      this.lastLapTime = lapTime;
      return this.formatLapTime(lapDuration);
    }
    return null;
  }

  getTimeValues() {
    const totalMilliseconds = this.elapsedTime;
    const milliseconds = Math.floor((totalMilliseconds % 1000) / 10);
    const seconds = Math.floor((totalMilliseconds / 1000) % 60);
    const minutes = Math.floor((totalMilliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));

    return { hours, minutes, seconds, milliseconds };
  }

  formatLapTime(timeInMs) {
    const { hours, minutes, seconds, milliseconds } = this.convertMsToTime(timeInMs);
    const formattedHours = hours > 0 ? `${this.padZero(hours)}:` : '';
    return `${formattedHours}${this.padZero(minutes)}:${this.padZero(seconds)}.${this.padZero(milliseconds)}`;
  }

  convertMsToTime(ms) {
    const milliseconds = Math.floor((ms % 1000) / 10);
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return { hours, minutes, seconds, milliseconds };
  }

  padZero(number) {
    return number.toString().padStart(2, '0');
  }

  updateTime() {
    if (this.running) {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateDisplay();
    }
  }

  updateDisplay() {
    const timeValues = this.getTimeValues();
    
    document.querySelector('#hours .time-value').textContent = this.padZero(timeValues.hours);
    document.querySelector('#minutes .time-value').textContent = this.padZero(timeValues.minutes);
    document.querySelector('#seconds .time-value').textContent = this.padZero(timeValues.seconds);
    document.querySelector('#milliseconds .time-value').textContent = this.padZero(timeValues.milliseconds);
  }
}

// Initialize DOM elements
const startPauseButton = document.getElementById('start-pause');
const resetButton = document.getElementById('reset');
const lapButton = document.getElementById('lap');
const lapsContainer = document.getElementById('laps');
const lapsTitle = document.getElementById('laps-title');

// Create stopwatch instance
const stopwatch = new Stopwatch();

// Initialize theme
function initializeTheme() {
  const themeButton = document.getElementById('theme-button');
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme');
  }
  
  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// Update button states
function updateButtons(running) {
  if (running) {
    startPauseButton.innerHTML = '<span>Pause</span>';
    startPauseButton.classList.add('running');
    resetButton.disabled = false;
    lapButton.disabled = false;
  } else {
    startPauseButton.innerHTML = '<span>Start</span>';
    startPauseButton.classList.remove('running');
    lapButton.disabled = true;
    resetButton.disabled = stopwatch.elapsedTime === 0;
  }
}

// Add lap to display
function addLapToDisplay(lap) {
  if (lapsTitle.classList.contains('hidden')) {
    lapsTitle.classList.remove('hidden');
  }
  
  const lapItem = document.createElement('div');
  lapItem.className = 'lap-item';
  
  const lapNumber = document.createElement('div');
  lapNumber.className = 'lap-number';
  lapNumber.textContent = `Lap ${lap.number}`;
  
  const lapTime = document.createElement('div');
  lapTime.className = 'lap-time';
  lapTime.textContent = stopwatch.formatLapTime(lap.lapTime);
  
  lapItem.appendChild(lapNumber);
  lapItem.appendChild(lapTime);
  lapsContainer.insertBefore(lapItem, lapsContainer.firstChild);
  
  updateLapHighlights();
}

// Update lap highlights
function updateLapHighlights() {
  if (stopwatch.laps.length > 1) {
    const existingHighlights = document.querySelectorAll('.fastest-lap, .slowest-lap');
    existingHighlights.forEach(el => el.classList.remove('fastest-lap', 'slowest-lap'));
    
    let fastestLap = Infinity;
    let slowestLap = 0;
    let fastestIndex = 0;
    let slowestIndex = 0;
    
    stopwatch.laps.forEach((lap) => {
      if (lap.lapTime < fastestLap) {
        fastestLap = lap.lapTime;
        fastestIndex = lap.number;
      }
      if (lap.lapTime > slowestLap) {
        slowestLap = lap.lapTime;
        slowestIndex = lap.number;
      }
    });
    
    const lapItems = document.querySelectorAll('.lap-item');
    lapItems.forEach(item => {
      const lapNumber = parseInt(item.querySelector('.lap-number').textContent.replace('Lap ', ''));
      if (lapNumber === fastestIndex) {
        item.querySelector('.lap-time').classList.add('fastest-lap');
      }
      if (lapNumber === slowestIndex) {
        item.querySelector('.lap-time').classList.add('slowest-lap');
      }
    });
  }
}

// Clear lap display
function clearLapDisplay() {
  lapsContainer.innerHTML = '';
  lapsTitle.classList.add('hidden');
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  
  startPauseButton.addEventListener('click', () => {
    if (stopwatch.running) {
      stopwatch.pause();
    } else {
      stopwatch.start();
      const timeValues = document.querySelectorAll('.time-value');
      timeValues.forEach(el => {
        el.style.transition = 'color 0.2s ease';
        el.style.color = 'var(--color-primary)';
        setTimeout(() => {
          el.style.color = '';
        }, 200);
      });
    }
    updateButtons(stopwatch.running);
  });
  
  resetButton.addEventListener('click', () => {
    stopwatch.reset();
    updateButtons(false);
    clearLapDisplay();
    
    const timeDisplay = document.querySelector('.time-display');
    timeDisplay.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
      timeDisplay.style.animation = '';
    }, 500);
  });
  
  lapButton.addEventListener('click', () => {
    if (stopwatch.running) {
      const newLap = stopwatch.lap();
      if (newLap) {
        addLapToDisplay(stopwatch.laps[stopwatch.laps.length - 1]);
      }
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      startPauseButton.click();
    }
    if (e.code === 'KeyR' && !stopwatch.running) {
      resetButton.click();
    }
    if (e.code === 'KeyL' && stopwatch.running) {
      lapButton.click();
    }
  });
});
