const API = {
  BASE_URL: 'https://homesecurity-cw0e.onrender.com',
  AUTH: {
    LOGIN: 'https://homesecurity-cw0e.onrender.com/api/auth/login',
    LOGOUT: 'https://homesecurity-cw0e.onrender.com/api/auth/logout'
  },
  PASSWORD_RESETS: {
    REQUEST: 'https://homesecurity-cw0e.onrender.com/api/password-resets/request',
    RESET: 'https://homesecurity-cw0e.onrender.com/api/password-resets/reset'
  }
};

// Set cookie helper
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/`;
}

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(API.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      setCookie('userEmail', email, 7);
      alert("Login successful!");
      window.location.href = "dashboard.html";
    } else {
      const error = await response.json();
      alert("Login failed: " + (error.message || response.statusText));
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Please try again.");
  }
});

function openReset() {
  document.getElementById('resetModal').style.display = 'flex';
}

function closeReset() {
  document.getElementById('resetModal').style.display = 'none';
}

document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('resetEmail').value;

  try {
    const response = await fetch(API.PASSWORD_RESETS.REQUEST, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      alert('Password reset link sent to your email.');
      closeReset();
    } else {
      const error = await response.json();
      alert("Reset failed: " + (error.message || response.statusText));
    }
  } catch (err) {
    console.error(err);
    alert("Failed to request password reset.");
  }
});
