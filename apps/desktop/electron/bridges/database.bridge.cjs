"use strict";

const { ipcMain } = require("electron");

const {
  assertAllowedChannel,
  createSuccess,
  createFailure
} = require("../security/ipc.security.cjs");

let databaseCoreCache = null;

function registerDatabaseBridge() {
  ipcMain.handle("database:test-connection", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:test-connection");

      const { connectionService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload);
      const result = await connectionService.testConnection(connection);

      return createSuccess(result);
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:list-tables", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:list-tables");

      const { schemaService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);
      const overview = await schemaService.getDatabaseOverview(connection);

      return createSuccess(overview);
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:list-columns", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:list-columns");

      const { tableService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);
      const columns = await tableService.getColumns(connection, {
        schema: payload.schema,
        table: payload.table
      });

      return createSuccess({
        schema: payload.schema || getDefaultSchema(connection),
        table: payload.table,
        columns
      });
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:get-table-rows", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:get-table-rows");

      const { tableService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);

      const result = await tableService.getRows(connection, {
        schema: payload.schema,
        table: payload.table,
        limit: payload.limit || 100,
        offset: payload.offset || 0
      });

      return createSuccess(result);
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:execute-query", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:execute-query");

      const { queryService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);

      const result = await queryService.execute(connection, {
        query: payload.query,
        values: payload.values || []
      });

      return createSuccess(result);
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:create-table", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:create-table");

      const { structureService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);

      const result = await structureService.createTable(connection, {
        schema: payload.schema,
        table: payload.table,
        name: payload.name,
        columns: payload.columns || []
      });

      return createSuccess(result);
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:drop-table", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:drop-table");

      const { structureService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);

      const result = await structureService.dropTable(connection, {
        schema: payload.schema,
        table: payload.table,
        confirmedText: payload.confirmedText
      });

      return createSuccess(result);
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:add-column", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:add-column");

      const { structureService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);

      const result = await structureService.addColumn(connection, {
        schema: payload.schema,
        table: payload.table,
        column: payload.column || {}
      });

      return createSuccess(result);
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:drop-column", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:drop-column");

      const { structureService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);

      const result = await structureService.dropColumn(connection, {
        schema: payload.schema,
        table: payload.table,
        columnName: payload.columnName,
        confirmedText: payload.confirmedText
      });

      return createSuccess(result);
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:preview-create-table", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:preview-create-table");

      const { structureService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);

      const sql = structureService.previewCreateTable(connection, {
        schema: payload.schema,
        table: payload.table,
        name: payload.name,
        columns: payload.columns || []
      });

      return createSuccess({
        sql
      });
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("database:preview-add-column", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("database:preview-add-column");

      const { structureService } = await getDatabaseCore();
      const connection = normalizeConnectionPayload(payload.connection || payload);

      const sql = structureService.previewAddColumn(connection, {
        schema: payload.schema,
        table: payload.table,
        column: payload.column || {}
      });

      return createSuccess({
        sql
      });
    } catch (error) {
      return createFailure(error);
    }
  });
}

async function getDatabaseCore() {
  if (!databaseCoreCache) {
    databaseCoreCache = await import("@dbpilot/database-core");
  }

  return databaseCoreCache;
}

function normalizeConnectionPayload(payload = {}) {
  const engine = String(payload.engine || "").trim();

  if (!["postgresql", "mysql", "sqlite"].includes(engine)) {
    throw new Error("DATABASE_ENGINE_NOT_SUPPORTED");
  }

  if (engine === "sqlite") {
    if (!payload.filePath) {
      throw new Error("SQLITE_FILE_PATH_REQUIRED");
    }

    return {
      id: payload.id || "",
      name: payload.name || "SQLite",
      engine,
      filePath: payload.filePath,
      readonly: Boolean(payload.readonly)
    };
  }

  if (!payload.host) {
    throw new Error("DATABASE_HOST_REQUIRED");
  }

  if (!payload.port) {
    throw new Error("DATABASE_PORT_REQUIRED");
  }

  if (!payload.user) {
    throw new Error("DATABASE_USER_REQUIRED");
  }

  if (!payload.database) {
    throw new Error("DATABASE_NAME_REQUIRED");
  }

  return {
    id: payload.id || "",
    name: payload.name || "",
    engine,
    host: payload.host,
    port: payload.port,
    user: payload.user,
    password: payload.password || "",
    database: payload.database,
    ssl: Boolean(payload.ssl),
    readonly: Boolean(payload.readonly)
  };
}

function getDefaultSchema(connection) {
  if (connection.engine === "sqlite") return "main";
  if (connection.engine === "mysql") return connection.database || "";

  return "public";
}

module.exports = {
  registerDatabaseBridge
};