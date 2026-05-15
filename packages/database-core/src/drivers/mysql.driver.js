import mysql from "mysql2/promise";

import { normalizeQueryResult } from "../utils/result-normalizer.util.js";
import { quoteIdentifier } from "../utils/identifier.util.js";

export const mysqlDriver = {
  engine: "mysql",

  async testConnection(connection) {
    const db = await createConnection(connection);

    try {
      const startedAt = Date.now();
      const [rows] = await db.query("SELECT NOW() AS now, DATABASE() AS database_name;");
      const durationMs = Date.now() - startedAt;

      return {
        ok: true,
        engine: "mysql",
        connected: true,
        durationMs,
        database: rows?.[0]?.database_name || connection.database,
        serverTime: rows?.[0]?.now || null,
        message: "Conexión MySQL correcta."
      };
    } finally {
      await db.end();
    }
  },

  async listSchemas(connection) {
    const db = await createConnection(connection);

    try {
      const [rows] = await db.query(`
        SELECT schema_name AS name
        FROM information_schema.schemata
        WHERE schema_name NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
        ORDER BY schema_name ASC;
      `);

      return rows;
    } finally {
      await db.end();
    }
  },

  async listTables(connection) {
    const db = await createConnection(connection);

    try {
      const [rows] = await db.query(
        `
        SELECT
          table_schema AS \`schema\`,
          table_name AS name,
          table_type AS type,
          table_rows AS rows
        FROM information_schema.tables
        WHERE table_schema = ?
        ORDER BY table_name ASC;
        `,
        [connection.database]
      );

      return rows.map((row) => ({
        schema: row.schema,
        name: row.name,
        fullName: `${row.schema}.${row.name}`,
        type: String(row.type || "").toUpperCase().includes("VIEW") ? "view" : "table",
        rows: Number(row.rows || 0)
      }));
    } finally {
      await db.end();
    }
  },

  async listColumns(connection, { schema = connection.database, table }) {
    if (!table) {
      throw new Error("TABLE_NAME_REQUIRED");
    }

    const db = await createConnection(connection);

    try {
      const [rows] = await db.query(
        `
        SELECT
          column_name AS name,
          column_type AS type,
          data_type AS raw_type,
          is_nullable AS is_nullable,
          column_key AS column_key,
          column_default AS default_value,
          extra AS extra
        FROM information_schema.columns
        WHERE table_schema = ?
          AND table_name = ?
        ORDER BY ordinal_position ASC;
        `,
        [schema, table]
      );

      return rows.map((column) => ({
        name: column.name,
        type: column.type,
        rawType: column.raw_type,
        nullable: column.is_nullable === "YES",
        primaryKey: column.column_key === "PRI",
        defaultValue: column.default_value,
        extra: column.extra || ""
      }));
    } finally {
      await db.end();
    }
  },

  async getTableRows(connection, { schema = connection.database, table, limit = 100, offset = 0 }) {
    if (!table) {
      throw new Error("TABLE_NAME_REQUIRED");
    }

    const db = await createConnection(connection);

    try {
      const safeSchema = quoteIdentifier(schema, "mysql");
      const safeTable = quoteIdentifier(table, "mysql");
      const safeLimit = normalizeLimit(limit);
      const safeOffset = normalizeOffset(offset);

      const [rows, fields] = await db.query(
        `SELECT * FROM ${safeSchema}.${safeTable} LIMIT ? OFFSET ?;`,
        [safeLimit, safeOffset]
      );

      return normalizeQueryResult(
        {
          rows,
          fields,
          rowCount: rows.length
        },
        {
          engine: "mysql",
          durationMs: 0
        }
      );
    } finally {
      await db.end();
    }
  },

  async executeQuery(connection, { query, values = [] }) {
    if (!query || !String(query).trim()) {
      throw new Error("SQL_QUERY_REQUIRED");
    }

    const db = await createConnection(connection);

    try {
      const startedAt = Date.now();
      const [rows, fields] = await db.query(query, Array.isArray(values) ? values : []);
      const durationMs = Date.now() - startedAt;

      return normalizeQueryResult(
        {
          rows,
          fields,
          rowCount: Array.isArray(rows) ? rows.length : rows.affectedRows || 0,
          affectedRows: rows?.affectedRows || 0,
          insertId: rows?.insertId || null
        },
        {
          engine: "mysql",
          durationMs
        }
      );
    } finally {
      await db.end();
    }
  }
};

async function createConnection(connection) {
  return mysql.createConnection({
    host: connection.host,
    port: Number(connection.port || 3306),
    user: connection.user,
    password: connection.password,
    database: connection.database,
    ssl: connection.ssl ? {} : undefined,
    connectTimeout: 6000,
    multipleStatements: false
  });
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