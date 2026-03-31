// ============ NAVBAR SCROLL ============
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
});

// ============ HAMBURGER ============
const hamburger = document.querySelector('.hamburger');
const navLinksList = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
  navLinksList?.classList.toggle('open');
});

// ============ REVEAL ON SCROLL ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============ TABS PRODUCTOS ============
const tabs = document.querySelectorAll('.tab[data-cat]');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.cat;
    document.querySelectorAll('.producto-card[data-cat]').forEach(card => {
      const match = cat === 'todos' || card.dataset.cat === cat;
      card.style.opacity = match ? '1' : '0';
      card.style.pointerEvents = match ? '' : 'none';
      card.style.display = match ? '' : 'none';
    });
  });
});

// ============ ACTIVE NAV LINK ============
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

// ============ POPUP BIENVENIDA ============
function initPopup() {
  const popup = document.getElementById('popup');
  if (!popup) return;

  // Solo mostrar si no fue visto en esta sesión
  if (sessionStorage.getItem('popupVisto')) {
    popup.classList.add('hidden');
    return;
  }

  // Mostrar con delay
  setTimeout(() => {
    popup.classList.remove('hidden');
  }, 1200);

  document.getElementById('popup-cerrar')?.addEventListener('click', cerrarPopup);
  document.getElementById('popup-skip')?.addEventListener('click', cerrarPopup);
  popup.addEventListener('click', (e) => {
    if (e.target === popup) cerrarPopup();
  });
}

function cerrarPopup() {
  const popup = document.getElementById('popup');
  if (!popup) return;
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.3s ease';
  setTimeout(() => popup.classList.add('hidden'), 300);
  sessionStorage.setItem('popupVisto', '1');
}

initPopup();

// ============ MODAL AUTH ============
const modalLogin = document.getElementById('modal-login');
const modalRegistro = document.getElementById('modal-registro');

function abrirModal(tipo) {
  if (tipo === 'login') {
    modalLogin?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    modalRegistro?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function cerrarModals() {
  modalLogin?.classList.add('hidden');
  modalRegistro?.classList.add('hidden');
  document.body.style.overflow = '';
}

// Cerrar al click fuera
[modalLogin, modalRegistro].forEach(m => {
  m?.addEventListener('click', e => { if (e.target === m) cerrarModals(); });
});

document.querySelectorAll('.modal-cerrar').forEach(btn => {
  btn.addEventListener('click', cerrarModals);
});

// Botones que abren login
document.querySelectorAll('[data-open="login"]').forEach(btn => {
  btn.addEventListener('click', () => abrirModal('login'));
});

document.querySelectorAll('[data-open="registro"]').forEach(btn => {
  btn.addEventListener('click', () => abrirModal('registro'));
});

// Toggle entre modals
document.getElementById('ir-registro')?.addEventListener('click', () => {
  cerrarModals();
  setTimeout(() => abrirModal('registro'), 100);
});
document.getElementById('ir-login')?.addEventListener('click', () => {
  cerrarModals();
  setTimeout(() => abrirModal('login'), 100);
});

// Precio lock → abrir login
document.querySelectorAll('.precio-lock').forEach(btn => {
  btn.addEventListener('click', () => abrirModal('login'));
});

// ============ TOAST ============
function showToast(msg, tipo = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${tipo}`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ============ SUPABASE AUTH FORMS ============
document.getElementById('form-login')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Ingresando...';
  btn.disabled = true;

  const { error } = await db.auth.signInWithPassword({ email, password: pass });

  if (error) {
    showToast('Email o contraseña incorrectos', 'rojo');
    btn.textContent = 'Ingresar';
    btn.disabled = false;
  } else {
    showToast('¡Bienvenido de vuelta! 🐾', 'verde');
    cerrarModals();
    setTimeout(() => location.reload(), 800);
  }
});

document.getElementById('form-registro')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const pass = document.getElementById('reg-pass').value;
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Creando cuenta...';
  btn.disabled = true;

  const { data, error } = await db.auth.signUp({ email, password: pass });

  if (error) {
    showToast('Error al registrarse: ' + error.message, 'rojo');
    btn.textContent = 'Crear cuenta';
    btn.disabled = false;
    return;
  }

  // Guardar perfil
  if (data.user) {
    await db.from('profiles').upsert({
      id: data.user.id,
      nombre: nombre,
      email: email,
      created_at: new Date().toISOString()
    });
  }

  showToast('¡Cuenta creada! Revisá tu email para confirmar 🐾', 'verde');
  cerrarModals();
  setTimeout(() => location.reload(), 1000);
});

// ============ SIGNOUT BUTTON ============
document.getElementById('btn-signout')?.addEventListener('click', async () => {
  await db.auth.signOut();
  showToast('Sesión cerrada', '');
  setTimeout(() => location.reload(), 800);
});
