export const APP_NAME = "DBPilot Studio";

export const APP_VERSION = "0.1.0";

export const APP_DESCRIPTION =
  "Desktop database explorer and editor for PostgreSQL, MySQL and SQLite.";

export const DATABASE_ENGINES = [
  {
    id: "postgresql",
    name: "PostgreSQL",
    shortName: "PG",
    description: "Conexión por host, puerto, usuario, contraseña y base.",
    icon: "⛁",
    status: "planned"
  },
  {
    id: "mysql",
    name: "MySQL / MariaDB",
    shortName: "MY",
    description: "Exploración de tablas, columnas, registros y SQL.",
    icon: "◇",
    status: "planned"
  },
  {
    id: "sqlite",
    name: "SQLite",
    shortName: "SQ",
    description: "Apertura directa de archivos .db, .sqlite y .sqlite3.",
    icon: "▣",
    status: "planned"
  }
];

export const APP_STATUS = {
  READY: "ready",
  CONNECTING: "connecting",
  ERROR: "error"
};

export const DEFAULT_ROUTE = "welcome";