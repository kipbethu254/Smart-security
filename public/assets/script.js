const API = {
  BASE_URL: 'https://homesecurity-cw0e.onrender.com',
  AUTH: {
    LOGIN: 'https://homesecurity-cw0e.onrender.com/api/auth/login',
    LOGOUT: 'https://homesecurity-cw0e.onrender.com/api/auth/logout'
  },
  USERS: {
    ME: 'https://homesecurity-cw0e.onrender.com/api/users/me',
    EMAIL: 'https://homesecurity-cw0e.onrender.com/api/users/email',
    PHONE: 'https://homesecurity-cw0e.onrender.com/api/users/phone',
    PASSWORD: 'https://homesecurity-cw0e.onrender.com/api/users/password'
  },
  DEVICES: {
    ME: 'https://homesecurity-cw0e.onrender.com/api/devices/me',
    STATUS: 'https://homesecurity-cw0e.onrender.com/api/devices/status'
  },
  ALERTS: 'https://homesecurity-cw0e.onrender.com/api/alerts',
  SSE_ALERTS: 'https://homesecurity-cw0e.onrender.com/api/sse/alerts',
  PASSWORD_RESETS: {
    REQUEST: 'https://homesecurity-cw0e.onrender.com/api/password-resets/request',
    RESET: 'https://homesecurity-cw0e.onrender.com/api/password-resets/reset'
  }
};

function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

const userEmail = getCookie('userEmail');
if (!userEmail) {
  window.location.href = "login.html";
}

async function fetchDevices() {
  try {
    const response = await fetch(API.DEVICES.ME, { credentials: 'include' });
    if (response.status === 401) {
      alert("Session expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }
    const devices = await response.json();
    renderDevices(devices);
  } catch (err) {
    console.error(err);
    document.getElementById('devicesContainer').innerHTML = "<p>Error loading devices.</p>";
  }
}

function renderDevices(devices) {
  const container = document.getElementById('devicesContainer');
  container.innerHTML = '';
  devices.forEach(device => {
    const statusColor = device.status === 'active' ? '#2ecc71' : '#e74c3c';
    const card = document.createElement('div');
    card.className = 'status-card';
    card.style.borderLeftColor = statusColor;
    card.innerHTML = `
      <h3>${device.name}</h3>
      <p>Status: <span class="status-text">${device.status}</span></p>
      <button onclick="toggleDevice('${device.id}')">Toggle</button>
    `;
    container.appendChild(card);
  });
}

async function toggleDevice(deviceId) {
  try {
    const response = await fetch(API.DEVICES.STATUS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ deviceId, action: 'toggle' })
    });
    if (response.ok) {
      fetchDevices();
    } else {
      alert("Failed to toggle device.");
    }
  } catch (err) {
    console.error(err);
    alert("Error toggling device.");
  }
}

function signOut() {
  fetch(API.AUTH.LOGOUT, { method: 'POST', credentials: 'include' })
    .finally(() => {
      document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      alert("Signed out successfully.");
      window.location.href = "login.html";
    });
}

function openProfile() {
  fetch(API.USERS.ME, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      document.getElementById('profileEmail').value = data.email || '';
      document.getElementById('profilePhone').value = data.phone || '';
      document.getElementById('profileModal').style.display = 'flex';
    })
    .catch(err => alert('Failed to load profile'));
}

function closeProfile() {
  document.getElementById('profileModal').style.display = 'none';
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('profileEmail').value;
  const phone = document.getElementById('profilePhone').value;
  const password = document.getElementById('profilePassword').value;

  if (email) await fetch(API.USERS.EMAIL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({email})
  });

  if (phone) await fetch(API.USERS.PHONE, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({phone})
  });

  if (password) await fetch(API.USERS.PASSWORD, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({password})
  });

  alert('Profile updated!');
  closeProfile();
});

function startSSE() {
  const evtSource = new EventSource(API.SSE_ALERTS);
  evtSource.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    const li = document.createElement('li');
    li.textContent = `${new Date(alert.timestamp).toLocaleTimeString()} - ${alert.message}`;
    const alertsList = document.getElementById('alertsList');
    alertsList.insertBefore(li, alertsList.firstChild);
  };
  evtSource.onerror = () => console.error('SSE connection error');
}

document.addEventListener('DOMContentLoaded', () => {
  fetchDevices();
  startSSE();
});
