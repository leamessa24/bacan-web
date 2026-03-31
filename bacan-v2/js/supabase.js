// ============================================================
// CONFIGURACIÓN SUPABASE - COMPLETAR CON TUS DATOS
// ============================================================
// 1. Entrá a supabase.com → tu proyecto → Settings → API
// 2. Copiá "Project URL" y "anon public key"
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';

// Cliente Supabase global
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// AUTH HELPERS
// ============================================================
async function getSession() {
  const { data: { session } } = await db.auth.getSession();
  return session;
}

async function getUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

async function getUserProfile(userId) {
  const { data } = await db.from('profiles').select('*').eq('id', userId).single();
  return data;
}

async function signOut() {
  await db.auth.signOut();
  window.location.href = '/index.html';
}

// ============================================================
// PRECIOS: visible solo si está logueado
// ============================================================
async function initPriceVisibility() {
  const session = await getSession();
  const priceEls = document.querySelectorAll('.precio-protegido');
  const lockEls = document.querySelectorAll('.precio-lock');

  if (session) {
    priceEls.forEach(el => el.style.display = 'block');
    lockEls.forEach(el => el.style.display = 'none');
  } else {
    priceEls.forEach(el => el.style.display = 'none');
    lockEls.forEach(el => el.style.display = 'flex');
  }
}

// ============================================================
// NAVBAR: actualiza según estado de sesión
// ============================================================
async function initNavAuth() {
  const session = await getSession();
  const navLogin = document.getElementById('nav-login');
  const navUser = document.getElementById('nav-user');
  const navUserName = document.getElementById('nav-username');

  if (session) {
    const profile = await getUserProfile(session.user.id);
    if (navLogin) navLogin.style.display = 'none';
    if (navUser) navUser.style.display = 'flex';
    if (navUserName) navUserName.textContent = profile?.nombre || session.user.email.split('@')[0];
  } else {
    if (navLogin) navLogin.style.display = 'flex';
    if (navUser) navUser.style.display = 'none';
  }
}
