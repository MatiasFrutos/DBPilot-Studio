import { quoteIdentifier } from "../utils/identifier.util.js";
import { getDefaultSchema } from "../utils/dialect.util.js";

export function buildCreateTableSql(engine, payload = {}) {
  const schema = payload.schema || getDefaultSchema(engine, payload.database);
  const table = payload.table || payload.name;

  if (!table) {
    throw new Error("TABLE_NAME_REQUIRED");
  }

  const columns = Array.isArray(payload.columns) ? payload.columns : [];

  if (!columns.length) {
    throw new Error("TABLE_COLUMNS_REQUIRED");
  }

  const fullName = buildQualifiedTableName(engine, schema, table);

  const columnDefinitions = columns.map((column) => {
    return buildColumnDefinition(engine, column);
  });

  return `CREATE TABLE ${fullName} (\n  ${columnDefinitions.join(",\n  ")}\n);`;
}

export function buildColumnDefinition(engine, column = {}) {
  if (!column.name) {
    throw new Error("COLUMN_NAME_REQUIRED");
  }

  if (!column.type) {
    throw new Error("COLUMN_TYPE_REQUIRED");
  }

  const name = quoteIdentifier(column.name, engine);
  const type = String(column.type).trim();
  const primaryKey = column.primaryKey ? " PRIMARY KEY" : "";
  const nullable = column.nullable === false && !column.primaryKey ? " NOT NULL" : "";
  const unique = column.unique ? " UNIQUE" : "";
  const defaultValue = column.defaultValue ? ` DEFAULT ${column.defaultValue}` : "";

  return `${name} ${type}${primaryKey}${nullable}${unique}${defaultValue}`;
}

export function buildQualifiedTableName(engine, schema, table) {
  if (engine === "sqlite") {
    return quoteIdentifier(table, engine);
  }

  return `${quoteIdentifier(schema || getDefaultSchema(engine), engine)}.${quoteIdentifier(table, engine)}`;
}