CREATE TABLE registros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  consentimiento INTEGER NOT NULL,
  consentimiento_at TEXT NOT NULL,
  origen_url TEXT NOT NULL,
  novedades INTEGER NOT NULL DEFAULT 0,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ref TEXT,
  estado TEXT NOT NULL CHECK (estado IN ('piloto', 'espera')),
  created_at TEXT NOT NULL
);

CREATE TABLE magic_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registro_id INTEGER NOT NULL REFERENCES registros(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE empresas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  empresa TEXT NOT NULL,
  cargo TEXT NOT NULL,
  empleados TEXT NOT NULL,
  email TEXT NOT NULL,
  mensaje TEXT,
  consentimiento INTEGER NOT NULL,
  consentimiento_at TEXT NOT NULL,
  contacto_ok INTEGER NOT NULL,
  origen_url TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ref TEXT,
  created_at TEXT NOT NULL
);
