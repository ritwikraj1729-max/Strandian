/* ============================================================
   STRANDIAN — script.js (with Task Complete confetti)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- DOM REFS ----------
  const dashboard = document.getElementById('dashboard');
  const taskInput = document.getElementById('taskInput');

  const presetBtns = document.querySelectorAll('.preset-btn');
  const timerDisplay = document.getElementById('timerDisplay');
  const btnStart = document.getElementById('btnStart');
  const btnPause = document.getElementById('btnPause');
  const btnResume = document.getElementById('btnResume');
  const btnReset = document.getElementById('btnReset');
  const sessionComplete = document.getElementById('sessionComplete');
  const timerCard = document.querySelector('.card-timer');

  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const placeholder = document.getElementById('uploadPlaceholder');
  const preview = document.getElementById('uploadPreview');
  const previewImg = document.getElementById('previewImage');
  const replaceBtn = document.getElementById('replaceBtn');
  const removeBtn = document.getElementById('removeBtn');

  const targetTextarea = document.getElementById('targetTextarea');
  const charCount = document.getElementById('charCount');

  // ---------- TASK COMPLETE ----------
  const completeBtn = document.getElementById('completeBtn');
  const completeMessage = document.getElementById('completeMessage');
  const confettiContainer = document.getElementById('confettiContainer');
  let isCompleteCelebrated = false;

  // ---------- TIMER STATE ----------
  let selectedMinutes = 30;
  let remainingSeconds = selectedMinutes * 60;
  let timerInterval = null;
  let isRunning = false;
  let isPaused = false;
  let isComplete = false;

  // ---------- TIMER HELPERS ----------
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isRunning = false;
    isPaused = false;
  }

  function setPresetActive(minutes) {
    presetBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.minutes, 10) === minutes);
    });
  }

  function resetTimerState() {
    stopTimer();
    remainingSeconds = selectedMinutes * 60;
    isComplete = false;
    isRunning = false;
    isPaused = false;
    updateDisplay();
    sessionComplete.classList.add('hidden');
    timerCard.classList.remove('glow');
  }

  // ---------- PRESETS ----------
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning || isPaused) return;
      const mins = parseInt(btn.dataset.minutes, 10);
      selectedMinutes = mins;
      remainingSeconds = mins * 60;
      updateDisplay();
      setPresetActive(mins);
      sessionComplete.classList.add('hidden');
      timerCard.classList.remove('glow');
      isComplete = false;
    });
  });

  setPresetActive(selectedMinutes);

  // ---------- TIMER CONTROLS ----------
  function startTimer() {
    if (isRunning) return;
    if (isPaused) return;
    if (isComplete) resetTimerState();
    if (remainingSeconds <= 0) {
      remainingSeconds = selectedMinutes * 60;
      updateDisplay();
    }
    isRunning = true;
    isPaused = false;
    isComplete = false;
    sessionComplete.classList.add('hidden');
    timerCard.classList.remove('glow');

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateDisplay();
      if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        updateDisplay();
        stopTimer();
        isRunning = false;
        isComplete = true;
        sessionComplete.classList.remove('hidden');
        timerCard.classList.add('glow');
        playBeep();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (isRunning && !isPaused) {
      isPaused = true;
      isRunning = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  }

  function resumeTimer() {
    if (isPaused && !isRunning) {
      isPaused = false;
      isRunning = true;
      timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        if (remainingSeconds <= 0) {
          remainingSeconds = 0;
          updateDisplay();
          stopTimer();
          isRunning = false;
          isComplete = true;
          sessionComplete.classList.remove('hidden');
          timerCard.classList.add('glow');
          playBeep();
        }
      }, 1000);
    }
  }

  function resetTimer() {
    stopTimer();
    isRunning = false;
    isPaused = false;
    isComplete = false;
    remainingSeconds = selectedMinutes * 60;
    updateDisplay();
    sessionComplete.classList.add('hidden');
    timerCard.classList.remove('glow');
  }

  btnStart.addEventListener('click', startTimer);
  btnPause.addEventListener('click', pauseTimer);
  btnResume.addEventListener('click', resumeTimer);
  btnReset.addEventListener('click', resetTimer);

  // ---------- BEEP (Web Audio) ----------
  function playBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.6);
    } catch (_) { /* ignore */ }
  }

  // ---------- KEYBOARD SHORTCUTS ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
      e.preventDefault();
      if (isRunning && !isPaused) pauseTimer();
      else if (isPaused) resumeTimer();
    }
    if ((e.key === 'r' || e.key === 'R') && e.target === document.body) {
      e.preventDefault();
      resetTimer();
    }
    if (e.key === 'Enter' && e.target === taskInput) {
      e.preventDefault();
      taskInput.blur();
    }
  });

  // ---------- IMAGE UPLOAD ----------
  function handleFile(file) {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, JPEG, or WEBP image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewImg.src = ev.target.result;
      placeholder.classList.add('hidden');
      preview.classList.add('show');
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  });

  replaceBtn.addEventListener('click', () => fileInput.click());
  removeBtn.addEventListener('click', () => {
    preview.classList.remove('show');
    placeholder.classList.remove('hidden');
    previewImg.src = '';
    fileInput.value = '';
  });

  // ---------- TARGET TEXTAREA ----------
  function updateCharCount() {
    const len = targetTextarea.value.length;
    charCount.textContent = len;
    targetTextarea.style.height = 'auto';
    targetTextarea.style.height = targetTextarea.scrollHeight + 'px';
  }
  targetTextarea.addEventListener('input', updateCharCount);
  setTimeout(updateCharCount, 0);

  // ---------- TASK COMPLETE (confetti celebration) ----------
  function triggerCelebration() {
    if (isCompleteCelebrated) return;
    isCompleteCelebrated = true;

    // Update button
    completeBtn.classList.add('celebrating');
    completeBtn.querySelector('.btn-text').textContent = '✓ Done!';

    // Show message
    completeMessage.classList.remove('hidden');
    setTimeout(() => completeMessage.classList.add('show'), 50);

    // Spawn confetti
    const emojis = ['🎉', '✨', '⭐', '🌟', '🎊', '💫', '🎈', '🏆', '🥇', '👏', '🔥', '💯'];
    const rect = completeBtn.getBoundingClientRect();
    const containerRect = confettiContainer.getBoundingClientRect();
    const cx = rect.left - containerRect.left + rect.width / 2;
    const cy = rect.top - containerRect.top + rect.height / 2;

    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      particle.textContent = emoji;
      const angle = Math.random() * 2 * Math.PI;
      const distance = 80 + Math.random() * 160;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 40;
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      particle.style.left = cx + 'px';
      particle.style.top = cy + 'px';
      particle.style.fontSize = (1.2 + Math.random() * 1.4) + 'rem';
      particle.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
      particle.style.animationDelay = (Math.random() * 0.2) + 's';
      confettiContainer.appendChild(particle);
    }

    // Reset after 3 seconds so it can be triggered again
    setTimeout(() => {
      // Remove confetti
      confettiContainer.innerHTML = '';
      // Reset button
      completeBtn.classList.remove('celebrating');
      completeBtn.querySelector('.btn-text').textContent = 'Mark as Complete';
      completeMessage.classList.remove('show');
      setTimeout(() => completeMessage.classList.add('hidden'), 300);
      isCompleteCelebrated = false;
    }, 3200);
  }

  completeBtn.addEventListener('click', triggerCelebration);

  // ---------- DRAG & DROP REORDERING ----------
  let draggedCard = null;

  dashboard.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const interactive = e.target.closest('input, textarea, button, select, .upload-area, .upload-btn, .ctrl-btn, .preset-btn, .complete-btn');
    if (interactive) {
      e.preventDefault();
      return;
    }
    draggedCard = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    requestAnimationFrame(() => {
      card.style.opacity = '0.4';
    });
  });

  dashboard.addEventListener('dragend', (e) => {
    const card = e.target.closest('.card');
    if (card) {
      card.classList.remove('dragging');
      card.style.opacity = '1';
    }
    document.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
    draggedCard = null;
  });

  dashboard.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetCard = e.target.closest('.card');
    if (!targetCard || targetCard === draggedCard) {
      document.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
      return;
    }
    document.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
    targetCard.classList.add('drag-over');
  });

  dashboard.addEventListener('dragleave', (e) => {
    const targetCard = e.target.closest('.card');
    if (targetCard) {
      targetCard.classList.remove('drag-over');
    }
  });

  dashboard.addEventListener('drop', (e) => {
    e.preventDefault();
    document.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
    const targetCard = e.target.closest('.card');
    if (!targetCard || !draggedCard || targetCard === draggedCard) return;
    const rect = targetCard.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isBefore = e.clientY < midY;
    if (isBefore) {
      targetCard.parentNode.insertBefore(draggedCard, targetCard);
    } else {
      targetCard.parentNode.insertBefore(draggedCard, targetCard.nextSibling);
    }
    draggedCard.classList.remove('dragging');
    draggedCard.style.opacity = '1';
    draggedCard = null;
  });

  // ---------- INIT ----------
  updateDisplay();
  console.log('Strandian ready — drag cards to reorder. Task Complete with confetti!');
});