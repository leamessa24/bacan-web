-- ============================================================
-- BACÁN PETSHOP - SQL SETUP PARA SUPABASE
-- Correr en: supabase.com → tu proyecto → SQL Editor → New query
-- ============================================================

-- 1. TABLA PROFILES (usuarios registrados)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuario ve solo su perfil, admin ve todos
CREATE POLICY "Usuarios ven su propio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios insertan su perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. TABLA PRODUCTOS (precios editables desde admin)
CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY,
  nombre TEXT,
  precio INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer productos
CREATE POLICY "Productos son públicos" ON productos
  FOR SELECT USING (TRUE);

-- Solo admin puede modificar (reemplazar con tu email)
-- CREATE POLICY "Solo admin modifica productos" ON productos
--   FOR ALL USING (auth.email() = 'TU_EMAIL_ADMIN@gmail.com');

-- 3. TABLA CONSULTAS (registro de pedidos/consultas WhatsApp)
CREATE TABLE IF NOT EXISTS consultas (
  id SERIAL PRIMARY KEY,
  cliente TEXT,
  producto TEXT,
  estado TEXT DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin ve consultas" ON consultas
  FOR ALL USING (TRUE); -- Restringir en prod

-- ============================================================
-- CONFIGURACIÓN EN SUPABASE:
-- 1. Authentication → Settings → Site URL: tu URL de Vercel
-- 2. Authentication → Email → Desactivar "Confirm email" 
--    (para que no necesiten confirmar al registrarse)
-- ============================================================
