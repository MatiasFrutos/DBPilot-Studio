import { postgresDriver } from "../drivers/postgres.driver.js";
import { mysqlDriver } from "../drivers/mysql.driver.js";
import { sqliteDriver } from "../drivers/sqlite.driver.js";
import { isSupportedEngine, normalizeEngine } from "../utils/dialect.util.js";

const DRIVER_BY_ENGINE = {
  postgresql: postgresDriver,
  mysql: mysqlDriver,
  sqlite: sqliteDriver
};

export function createDatabaseConnection(connection = {}) {
  const normalizedConnection = normalizeConnection(connection);
  const driver = getDriver(normalizedConnection.engine);

  return {
    engine: normalizedConnection.engine,
    connection: normalizedConnection,
    driver,

    async testConnection() {
      return driver.testConnection(normalizedConnection);
    },

    async listSchemas() {
      return driver.listSchemas(normalizedConnection);
    },

    async listTables() {
      return driver.listTables(normalizedConnection);
    },

    async listColumns(payload) {
      return driver.listColumns(normalizedConnection, payload);
    },

    async getTableRows(payload) {
      return driver.getTableRows(normalizedConnection, payload);
    },

    async executeQuery(payload) {
      return driver.executeQuery(normalizedConnection, payload);
    }
  };
}

export function getDriver(engine) {
  const normalizedEngine = normalizeEngine(engine);

  if (!isSupportedEngine(normalizedEngine)) {
    throw new Error(`DATABASE_ENGINE_NOT_SUPPORTED: ${engine}`);
  }

  return DRIVER_BY_ENGINE[normalizedEngine];
}

export function normalizeConnection(connection = {}) {
  const engine = normalizeEngine(connection.engine);

  if (!isSupportedEngine(engine)) {
    throw new Error(`DATABASE_ENGINE_NOT_SUPPORTED: ${connection.engine}`);
  }

  if (engine === "sqlite") {
    return {
      id: connection.id || "",
      name: connection.name || "SQLite",
      engine,
      filePath: connection.filePath || "",
      readonly: Boolean(connection.readonly)
    };
  }

  return {
    id: connection.id || "",
    name: connection.name || "",
    engine,
    host: connection.host || "127.0.0.1",
    port: connection.port || (engine === "postgresql" ? "5432" : "3306"),
    user: connection.user || "",
    password: connection.password || "",
    database: connection.database || "",
    ssl: Boolean(connection.ssl),
    readonly: Boolean(connection.readonly)
  };
}

export const connectionService = {
  createDatabaseConnection,
  getDriver,
  normalizeConnection,

  async testConnection(connection) {
    const db = createDatabaseConnection(connection);

    return db.testConnection();
  }
};