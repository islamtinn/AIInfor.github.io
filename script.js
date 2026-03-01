(() => {
  // Fade-in animation
  const fadeEls = document.querySelectorAll(".fade");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("show");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  fadeEls.forEach(el => observer.observe(el));

  // Smooth scroll for anchor links
  const smoothLinks = document.querySelectorAll('a[href^="#"]');
  smoothLinks.forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ----- Simple client-side auth (demo only) -----
  const storageKey = 'aiq_users_v1';
  const sessionKey = 'aiq_current_user';
  const norm = v => (v || '').trim().toLowerCase();

  const loadUsers = () => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  };

  const saveUsers = users => localStorage.setItem(storageKey, JSON.stringify(users));
  const setCurrentUser = email => localStorage.setItem(sessionKey, email);
  const getCurrentUserEmail = () => localStorage.getItem(sessionKey);
  const getCurrentUser = () => {
    const email = getCurrentUserEmail();
    if (!email) return null;
    const users = loadUsers();
    return users.find(u => norm(u.email) === norm(email)) || null;
  };
  const logout = () => localStorage.removeItem(sessionKey);

  const registerUser = ({ name, nickname, email, password }) => {
    const users = loadUsers();
    if (users.some(u => norm(u.email) === norm(email))) return { ok: false, msg: 'Бұл email бұрын тіркелген' };
    if (users.some(u => norm(u.nickname) === norm(nickname))) return { ok: false, msg: 'Бұл ник бұрын тіркелген' };
    if (users.some(u => norm(u.name) === norm(name))) return { ok: false, msg: 'Бұл ат бұрын тіркелген' };
    const user = {
      name: name.trim(),
      nickname: nickname.trim(),
      email: email.trim(),
      password,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    setCurrentUser(user.email);
    return { ok: true, user };
  };

  const loginUser = ({ email, password }) => {
    const users = loadUsers();
    const user = users.find(u => norm(u.email) === norm(email));
    if (!user) return { ok: false, msg: 'Email табылмады' };
    if (user.password !== password) return { ok: false, msg: 'Құпиясөз қате' };
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    setCurrentUser(user.email);
    return { ok: true, user };
  };

  const showStatus = (el, msg, type = 'success') => {
    if (!el) return;
    el.textContent = msg;
    el.className = 'alert ' + (type === 'error' ? 'error' : 'success');
    el.style.display = 'block';
  };

  // Registration form
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = regForm.fullname.value;
      const nickname = regForm.nickname.value;
      const email = regForm.email.value;
      const password = regForm.password.value;
      const status = document.getElementById('registerMsg');
      if (!name || !nickname || !email || !password) {
        showStatus(status, 'Барлық жолды толтырыңыз', 'error');
        return;
      }
      const res = registerUser({ name, nickname, email, password });
      if (!res.ok) {
        showStatus(status, res.msg, 'error');
        return;
      }
      showStatus(status, 'Сәтті тіркелдіңіз! Профильге өтеміз...', 'success');
      setTimeout(() => window.location.href = 'profile.html', 800);
    });
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = loginForm.loginEmail.value;
      const password = loginForm.loginPassword.value;
      const status = document.getElementById('loginMsg');
      const res = loginUser({ email, password });
      if (!res.ok) {
        showStatus(status, res.msg, 'error');
        return;
      }
      showStatus(status, 'Қош келдіңіз! Профильге өтеміз...', 'success');
      setTimeout(() => window.location.href = 'profile.html', 600);
    });
  }

  // Profile page render
  const profileBox = document.getElementById('profileBox');
  if (profileBox) {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'register.html';
      return;
    }
    const masked = '•'.repeat(Math.max(6, user.password.length));
    profileBox.innerHTML = `
      <div class="profile-grid">
        <div class="info-box"><strong>Аты-жөні:</strong><br>${user.name}</div>
        <div class="info-box"><strong>Ник:</strong><br>${user.nickname}</div>
        <div class="info-box"><strong>Email:</strong><br>${user.email}</div>
        <div class="info-box"><strong>Құпиясөз:</strong><br><span class="mask">${masked}</span></div>
        <div class="info-box"><strong>Тіркелген күні:</strong><br><span class="meta">${new Date(user.createdAt).toLocaleString()}</span></div>
        <div class="info-box"><strong>Соңғы кіру:</strong><br><span class="meta">${new Date(user.lastLogin).toLocaleString()}</span></div>
      </div>
    `;
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      logout();
      window.location.href = 'register.html';
    });
  }

  // Account link text
  const accountLink = document.getElementById('accountLink');
  if (accountLink) {
    const user = getCurrentUser();
    if (user) {
      accountLink.textContent = 'Профиль';
      accountLink.href = 'profile.html';
    } else {
      accountLink.textContent = 'Тіркелу';
      accountLink.href = 'register.html';
    }
  }
})();
