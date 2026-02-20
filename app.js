/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CLINIC FLOW · APP LOGIC
   Implements: App Specification V2.2
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

'use strict';

// ── State ──────────────────────────────────────────────
const state = {
  role: null,
  phone: '',
  authToken: null,
  screenHistory: [],
  otpResendTimer: null,
  lateCooldown: false,
};

// ── Auth Token Simulation (localStorage) ───────────────
function getToken()    { return localStorage.getItem('cf_auth_token'); }
function saveToken(t)  { localStorage.setItem('cf_auth_token', t); }
function clearToken()  { localStorage.removeItem('cf_auth_token'); }

// ━━ SCREEN ROUTING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Navigate to a screen by id, recording history */
function goTo(screenId) {
  const current = document.querySelector('.screen.active');
  if (!current) return;
  if (current.id === screenId) return;

  state.screenHistory.push(current.id);
  current.classList.add('slide-out');
  current.classList.remove('active');

  setTimeout(() => current.classList.remove('slide-out'), 300);

  const next = document.getElementById(screenId);
  if (next) {
    next.classList.add('active');
  }
}

/** Go back one step */
function goBack() {
  const prev = state.screenHistory.pop();
  if (!prev) return;
  goTo(prev);
  // fix: after pushing into history again, pop the last entry we just pushed
  state.screenHistory.pop();
}

// ━━ SPLASH (Screen 0.1) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.addEventListener('DOMContentLoaded', () => {
  // Spec §2 Screen 0.1: check for persistent token
  setTimeout(() => {
    const token = getToken();
    if (token) {
      state.authToken = token;
      goTo('screen-dashboard');          // skip onboarding
    } else {
      goTo('screen-role');               // first run / logged out
    }
  }, 2400);                              // matches loader animation
});

// ━━ ROLE SELECTION (Screen 0.2) ━━━━━━━━━━━━━━━━━━━━━━

function selectRole(role) {
  state.role = role;
  // Update role label on phone screen
  const label = document.getElementById('phone-role-label');
  if (label) {
    label.textContent = role.charAt(0).toUpperCase() + role.slice(1);
  }
  goTo('screen-phone');
}

// ━━ PHONE NUMBER ENTRY (Screen 0.3a) ━━━━━━━━━━━━━━━━━

function handlePhoneInput(input) {
  // Allow only digits and hyphens
  input.value = input.value.replace(/[^\d\-]/g, '');
  const raw = input.value.replace(/\D/g, '');
  const btn = document.getElementById('btn-send-otp');
  btn.disabled = raw.length < 9;
}

function showCountryPicker() {
  // Minimal: just show Malaysia for this MVP
  showToast('Only +60 (Malaysia) available in MVP');
}

function sendOTP() {
  const raw = document.getElementById('phone-input').value.replace(/\D/g, '');
  state.phone = '+60' + raw;
  // Update OTP screen display
  const disp = document.getElementById('otp-phone-display');
  if (disp) disp.textContent = state.phone;

  goTo('screen-otp');
  startResendTimer();

  // Show biometric option if available (modern browsers)
  const bio = document.getElementById('biometric-option');
  if (window.PublicKeyCredential) bio.classList.remove('hidden');
}

// ━━ OTP VERIFICATION (Screen 0.3b) ━━━━━━━━━━━━━━━━━━━

function otpInput(input, idx) {
  const boxes = document.querySelectorAll('.otp-box');
  const val = input.value.replace(/\D/g, '');
  input.value = val;
  if (val) {
    input.classList.add('filled');
    if (idx < 5) boxes[idx + 1].focus();
  } else {
    input.classList.remove('filled');
  }
  checkOTPComplete(boxes);
}

function otpKeydown(input, idx) {
  const boxes = document.querySelectorAll('.otp-box');
  if (event.key === 'Backspace' && !input.value && idx > 0) {
    boxes[idx - 1].focus();
    boxes[idx - 1].value = '';
    boxes[idx - 1].classList.remove('filled');
    checkOTPComplete(boxes);
  }
}

function checkOTPComplete(boxes) {
  const filled = [...boxes].every(b => b.value.length === 1);
  document.getElementById('btn-verify').disabled = !filled;
}

function startResendTimer() {
  let secs = 30;
  const countdown = document.getElementById('resend-countdown');
  const timerText = document.getElementById('resend-timer');
  const btnResend = document.getElementById('btn-resend');
  if (state.otpResendTimer) clearInterval(state.otpResendTimer);

  timerText.classList.remove('hidden');
  btnResend.classList.add('hidden');
  countdown.textContent = secs;

  state.otpResendTimer = setInterval(() => {
    secs--;
    countdown.textContent = secs;
    if (secs <= 0) {
      clearInterval(state.otpResendTimer);
      timerText.classList.add('hidden');
      btnResend.classList.remove('hidden');
    }
  }, 1000);
}

function resendOTP() {
  startResendTimer();
  showToast('A new code has been sent');
}

function verifyOTP() {
  const boxes = document.querySelectorAll('.otp-box');
  const code  = [...boxes].map(b => b.value).join('');
  // MVP: accept any 6-digit code (real impl would call backend)
  if (code.length === 6) {
    completeLogin();
  }
}

function verifyBiometric() {
  // Simulate biometric for demo
  showToast('Face ID verified ✓');
  setTimeout(completeLogin, 800);
}

function completeLogin() {
  // Spec §2: create persistent token on login
  const fakeToken = 'cf_' + Math.random().toString(36).substr(2, 16);
  saveToken(fakeToken);
  state.authToken = fakeToken;
  goTo('screen-dashboard');
}

// ━━ DASHBOARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function callAmbulance() {
  // Spec §3 Screen 1.2: invoke native dialer
  window.location.href = 'tel:999';
}

function logout() {
  // Spec §2: delete token on logout
  clearToken();
  state.authToken = null;
  state.role = null;
  state.screenHistory = [];

  // Reset phone input
  const pi = document.getElementById('phone-input');
  if (pi) pi.value = '';

  goTo('screen-role');
  showToast('You have been logged out');
}

// ━━ VIRTUAL QUEUE (Screen 2.x) ━━━━━━━━━━━━━━━━━━━━━━━

// Screen 2.1: Running Late — "Swap with Next" logic
function runningLate() {
  if (state.lateCooldown) {
    showToast('You can only use this once every 10 minutes');
    return;
  }
  openModal('modal-late');
}

function confirmLate() {
  closeModal('modal-late');
  // Spec §4 Screen 2.1: i ↔ i+1 swap
  state.lateCooldown = true;
  showToast('Swapped with the person behind you');
  // Re-enable after 10 minutes
  setTimeout(() => { state.lateCooldown = false; }, 10 * 60 * 1000);
}

// Screen 2.2: Arrival Check-In — Honor System Unlock
function confirmArrival() {
  openModal('modal-arrival');
}

function completeArrival() {
  closeModal('modal-arrival');
  showToast('Check-in confirmed! Please wait to be called.');
  // Go back to dashboard
  setTimeout(() => goTo('screen-dashboard'), 1200);
}

// ━━ MODAL HELPERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = '';
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

// Close modal on backdrop tap
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
  }
});

// ━━ TOAST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const text  = document.getElementById('toast-msg');
  text.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}
