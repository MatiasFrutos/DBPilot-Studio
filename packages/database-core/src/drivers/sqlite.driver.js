import Database from "better-sqlite3";

import { normalizeQueryResult } from "../utils/result-normalizer.util.js";
import { quoteIdentifier } from "../utils/identifier.util.js";
import { isSelectQuery } from "../utils/sql.util.js";

export const sqliteDriver = {
  engine: "sqlite",

  async testConnection(connection) {
    const db = openDatabase(connection);

    try {
      const startedAt = Date.now();
      const row = db.prepare("SELECT sqlite_version() AS version;").get();
      const durationMs = Date.now() - startedAt;

      return {
        ok: true,
        engine: "sqlite",
        connected: true,
        durationMs,
        database: connection.filePath,
        serverTime: null,
        version: row?.version || "",
        message: "Archivo SQLite abierto correctamente."
      };
    } finally {
      db.close();
    }
  },

  async listSchemas() {
    return [
      {
        name: "main"
      }
    ];
  },

  async listTables(connection) {
    const db = openDatabase(connection);

    try {
      const rows = db
        .prepare(
          `
          SELECT
            name,
            type
          FROM sqlite_master
          WHERE type IN ('table', 'view')
            AND name NOT LIKE 'sqlite_%'
          ORDER BY type ASC, name ASC;
          `
        )
        .all();

      return rows.map((row) => ({
        schema: "main",
        name: row.name,
        fullName: `main.${row.name}`,
        type: row.type === "view" ? "view" : "table",
        rows: row.type === "table" ? getSqliteTableCount(db, row.name) : 0
      }));
    } finally {
      db.close();
    }
  },

  async listColumns(connection, { table }) {
    if (!table) {
      throw new Error("TABLE_NAME_REQUIRED");
    }

    const db = openDatabase(connection);

    try {
      const safeTable = quoteIdentifier(table, "sqlite");
      const rows = db.prepare(`PRAGMA table_info(${safeTable});`).all();

      return rows.map((column) => ({
        name: column.name,
        type: column.type || "TEXT",
        rawType: column.type || "TEXT",
        nullable: column.notnull !== 1,
        primaryKey: column.pk === 1,
        defaultValue: column.dflt_value
      }));
    } finally {
      db.close();
    }
  },

  async getTableRows(connection, { table, limit = 100, offset = 0 }) {
    if (!table) {
      throw new Error("TABLE_NAME_REQUIRED");
    }

    const db = openDatabase(connection, {
      readonly: Boolean(connection.readonly)
    });

    try {
      const safeTable = quoteIdentifier(table, "sqlite");
      const safeLimit = normalizeLimit(limit);
      const safeOffset = normalizeOffset(offset);

      const startedAt = Date.now();
      const rows = db
        .prepare(`SELECT * FROM ${safeTable} LIMIT ? OFFSET ?;`)
        .all(safeLimit, safeOffset);
      const durationMs = Date.now() - startedAt;

      return normalizeQueryResult(
        {
          rows,
          fields: rows.length ? Object.keys(rows[0]).map((name) => ({ name })) : [],
          rowCount: rows.length
        },
        {
          engine: "sqlite",
          durationMs
        }
      );
    } finally {
      db.close();
    }
  },

  async executeQuery(connection, { query, values = [] }) {
    if (!query || !String(query).trim()) {
      throw new Error("SQL_QUERY_REQUIRED");
    }

    const db = openDatabase(connection, {
      readonly: Boolean(connection.readonly)
    });

    try {
      const startedAt = Date.now();
      const sql = String(query).trim();

      if (isSelectQuery(sql)) {
        const statement = db.prepare(sql);
        const rows = statement.all(...normalizeValues(values));
        const durationMs = Date.now() - startedAt;

        return normalizeQueryResult(
          {
            rows,
            fields: rows.length ? Object.keys(rows[0]).map((name) => ({ name })) : [],
            rowCount: rows.length
          },
          {
            engine: "sqlite",
            durationMs
          }
        );
      }

      const statement = db.prepare(sql);
      const result = statement.run(...normalizeValues(values));
      const durationMs = Date.now() - startedAt;

      return normalizeQueryResult(
        {
          rows: [],
          fields: [],
          rowCount: result.changes || 0,
          affectedRows: result.changes || 0,
          insertId: result.lastInsertRowid ? String(result.lastInsertRowid) : null
        },
        {
          engine: "sqlite",
          durationMs
        }
      );
    } finally {
      db.close();
    }
  }
};

function openDatabase(connection, options = {}) {
  if (!connection.filePath) {
    throw new Error("SQLITE_FILE_PATH_REQUIRED");
  }

  return new Database(connection.filePath, {
    readonly: Boolean(options.readonly || connection.readonly),
    fileMustExist: true
  });
}

function getSqliteTableCount(db, table) {
  try {
    const safeTable = quoteIdentifier(table, "sqlite");
    const row = db.prepare(`SELECT COUNT(*) AS total FROM ${safeTable};`).get();

    return Number(row?.total || 0);
  } catch {
    return 0;
  }
}

function normalizeValues(values) {
  return Array.isArray(values) ? values : [];
}

function normalizeLimit(limit) {
  const value = Number(limit);

  if (!Number.isFinite(value) || value <= 0) {
    return 100;
  }

  return Math.min(Math.trunc(value), 1000);
}

function normalizeOffset(offset) {
  const value = Number(offset);

  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.trunc(value);
}