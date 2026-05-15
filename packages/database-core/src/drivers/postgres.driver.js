import pg from "pg";

import { normalizeQueryResult } from "../utils/result-normalizer.util.js";
import { quoteIdentifier } from "../utils/identifier.util.js";

const { Pool } = pg;

export const postgresDriver = {
  engine: "postgresql",

  async testConnection(connection) {
    const pool = createPool(connection);

    try {
      const startedAt = Date.now();
      const result = await pool.query("SELECT NOW() AS now, current_database() AS database_name;");
      const durationMs = Date.now() - startedAt;

      return {
        ok: true,
        engine: "postgresql",
        connected: true,
        durationMs,
        database: result.rows?.[0]?.database_name || connection.database,
        serverTime: result.rows?.[0]?.now || null,
        message: "Conexión PostgreSQL correcta."
      };
    } finally {
      await pool.end();
    }
  },

  async listSchemas(connection) {
    const pool = createPool(connection);

    try {
      const result = await pool.query(`
        SELECT schema_name AS name
        FROM information_schema.schemata
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog')
        ORDER BY schema_name ASC;
      `);

      return result.rows;
    } finally {
      await pool.end();
    }
  },

  async listTables(connection) {
    const pool = createPool(connection);

    try {
      const result = await pool.query(`
        SELECT
          table_schema AS schema,
          table_name AS name,
          table_type AS type
        FROM information_schema.tables
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
        ORDER BY table_schema ASC, table_name ASC;
      `);

      const rowsByTable = await getEstimatedRows(pool);

      return result.rows.map((row) => {
        const fullName = `${row.schema}.${row.name}`;

        return {
          schema: row.schema,
          name: row.name,
          fullName,
          type: row.type === "VIEW" ? "view" : "table",
          rows: rowsByTable.get(fullName) || 0
        };
      });
    } finally {
      await pool.end();
    }
  },

  async listColumns(connection, { schema = "public", table }) {
    if (!table) {
      throw new Error("TABLE_NAME_REQUIRED");
    }

    const pool = createPool(connection);

    try {
      const result = await pool.query(
        `
        SELECT
          c.column_name AS name,
          c.data_type AS data_type,
          c.udt_name AS udt_name,
          c.character_maximum_length AS max_length,
          c.numeric_precision AS numeric_precision,
          c.numeric_scale AS numeric_scale,
          c.is_nullable AS is_nullable,
          c.column_default AS default_value,
          CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END AS primary_key
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT
            ku.table_schema,
            ku.table_name,
            ku.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
           AND tc.table_schema = ku.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk
          ON c.table_schema = pk.table_schema
         AND c.table_name = pk.table_name
         AND c.column_name = pk.column_name
        WHERE c.table_schema = $1
          AND c.table_name = $2
        ORDER BY c.ordinal_position ASC;
        `,
        [schema, table]
      );

      return result.rows.map((column) => ({
        name: column.name,
        type: formatPostgresType(column),
        rawType: column.data_type,
        nullable: column.is_nullable === "YES",
        primaryKey: Boolean(column.primary_key),
        defaultValue: column.default_value
      }));
    } finally {
      await pool.end();
    }
  },

  async getTableRows(connection, { schema = "public", table, limit = 100, offset = 0 }) {
    if (!table) {
      throw new Error("TABLE_NAME_REQUIRED");
    }

    const pool = createPool(connection);

    try {
      const safeSchema = quoteIdentifier(schema, "postgresql");
      const safeTable = quoteIdentifier(table, "postgresql");
      const safeLimit = normalizeLimit(limit);
      const safeOffset = normalizeOffset(offset);

      const result = await pool.query(
        `SELECT * FROM ${safeSchema}.${safeTable} LIMIT $1 OFFSET $2;`,
        [safeLimit, safeOffset]
      );

      return normalizeQueryResult(result, {
        engine: "postgresql",
        durationMs: 0
      });
    } finally {
      await pool.end();
    }
  },

  async executeQuery(connection, { query, values = [] }) {
    if (!query || !String(query).trim()) {
      throw new Error("SQL_QUERY_REQUIRED");
    }

    const pool = createPool(connection);

    try {
      const startedAt = Date.now();
      const result = await pool.query(query, Array.isArray(values) ? values : []);
      const durationMs = Date.now() - startedAt;

      return normalizeQueryResult(result, {
        engine: "postgresql",
        durationMs
      });
    } finally {
      await pool.end();
    }
  }
};

function createPool(connection) {
  return new Pool({
    host: connection.host,
    port: Number(connection.port || 5432),
    user: connection.user,
    password: connection.password,
    database: connection.database,
    ssl: connection.ssl ? { rejectUnauthorized: false } : false,
    max: 4,
    idleTimeoutMillis: 4000,
    connectionTimeoutMillis: 6000
  });
}

async function getEstimatedRows(pool) {
  const result = await pool.query(`
    SELECT
      schemaname AS schema,
      relname AS name,
      n_live_tup::bigint AS rows
    FROM pg_stat_user_tables;
  `);

  return new Map(
    result.rows.map((row) => [
      `${row.schema}.${row.name}`,
      Number(row.rows || 0)
    ])
  );
}

function formatPostgresType(column) {
  if (column.data_type === "character varying" && column.max_length) {
    return `varchar(${column.max_length})`;
  }

  if (column.data_type === "character" && column.max_length) {
    return `char(${column.max_length})`;
  }

  if (column.data_type === "numeric" && column.numeric_precision) {
    if (column.numeric_scale !== null && column.numeric_scale !== undefined) {
      return `numeric(${column.numeric_precision},${column.numeric_scale})`;
    }

    return `numeric(${column.numeric_precision})`;
  }

  if (column.data_type === "USER-DEFINED") {
    return column.udt_name;
  }

  return column.data_type;
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