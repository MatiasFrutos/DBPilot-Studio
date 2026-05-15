const SUPPORTED_ENGINES = new Set(["postgresql", "mysql", "sqlite"]);

export function normalizeEngine(engine) {
  const value = String(engine || "").trim().toLowerCase();

  const aliases = {
    postgres: "postgresql",
    pg: "postgresql",
    mariadb: "mysql",
    my: "mysql",
    sqlite3: "sqlite"
  };

  return aliases[value] || value;
}

export function isSupportedEngine(engine) {
  return SUPPORTED_ENGINES.has(normalizeEngine(engine));
}

export function getDialect(engine) {
  const normalizedEngine = normalizeEngine(engine);

  if (!isSupportedEngine(normalizedEngine)) {
    throw new Error(`DATABASE_ENGINE_NOT_SUPPORTED: ${engine}`);
  }

  const dialects = {
    postgresql: {
      engine: "postgresql",
      name: "PostgreSQL",
      quote: '"',
      defaultSchema: "public",
      parameterPrefix: "$"
    },
    mysql: {
      engine: "mysql",
      name: "MySQL / MariaDB",
      quote: "`",
      defaultSchema: "",
      parameterPrefix: "?"
    },
    sqlite: {
      engine: "sqlite",
      name: "SQLite",
      quote: '"',
      defaultSchema: "main",
      parameterPrefix: "?"
    }
  };

  return dialects[normalizedEngine];
}

export function getDefaultPort(engine) {
  const normalizedEngine = normalizeEngine(engine);

  const ports = {
    postgresql: "5432",
    mysql: "3306",
    sqlite: ""
  };

  return ports[normalizedEngine] || "";
}

export function getDefaultSchema(engine, database = "") {
  const normalizedEngine = normalizeEngine(engine);

  if (normalizedEngine === "mysql") return database || "";
  if (normalizedEngine === "sqlite") return "main";

  return "public";
}