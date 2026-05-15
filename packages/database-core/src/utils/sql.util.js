export function compactSql(sql) {
  return String(sql || "")
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSelectQuery(sql) {
  const compact = compactSql(sql).toLowerCase();

  return compact.startsWith("select ") || compact.startsWith("with ");
}

export function hasWhereClause(sql) {
  return /\bwhere\b/i.test(compactSql(sql));
}

export function isDeleteWithoutWhere(sql) {
  const compact = compactSql(sql).toLowerCase();

  return compact.startsWith("delete from ") && !hasWhereClause(compact);
}

export function isUpdateWithoutWhere(sql) {
  const compact = compactSql(sql).toLowerCase();

  return compact.startsWith("update ") && !hasWhereClause(compact);
}

export function isDangerousQuery(sql) {
  const compact = compactSql(sql).toLowerCase();

  const dangerousPatterns = [
    /^drop\s+database\b/,
    /^drop\s+schema\b/,
    /^drop\s+table\b/,
    /^truncate\s+table\b/,
    /\bdrop\s+database\b/,
    /\bdrop\s+schema\b/,
    /\bdrop\s+table\b/,
    /\btruncate\s+table\b/
  ];

  return dangerousPatterns.some((pattern) => pattern.test(compact));
}

export function isStructureQuery(sql) {
  const compact = compactSql(sql).toLowerCase();

  return (
    compact.startsWith("create table ") ||
    compact.startsWith("alter table ") ||
    compact.startsWith("drop table ") ||
    compact.startsWith("create index ") ||
    compact.startsWith("drop index ")
  );
}

export function getQueryType(sql) {
  const compact = compactSql(sql).toLowerCase();

  if (compact.startsWith("select ") || compact.startsWith("with ")) return "SELECT";
  if (compact.startsWith("insert ")) return "INSERT";
  if (compact.startsWith("update ")) return "UPDATE";
  if (compact.startsWith("delete ")) return "DELETE";
  if (compact.startsWith("create ")) return "CREATE";
  if (compact.startsWith("alter ")) return "ALTER";
  if (compact.startsWith("drop ")) return "DROP";
  if (compact.startsWith("truncate ")) return "TRUNCATE";
  if (compact.startsWith("pragma ")) return "PRAGMA";

  return "SQL";
}

export function ensureSemicolon(sql) {
  const compact = compactSql(sql);

  if (!compact) return "";

  return compact.endsWith(";") ? compact : `${compact};`;
}

export function applyLimitToSelect(sql, limit = 100) {
  const compact = compactSql(sql);

  if (!isSelectQuery(compact)) {
    return compact;
  }

  if (/\blimit\s+\d+/i.test(compact)) {
    return compact;
  }

  const safeLimit = normalizeLimit(limit);

  return `${compact.replace(/;$/, "")} LIMIT ${safeLimit};`;
}

function normalizeLimit(limit) {
  const value = Number(limit);

  if (!Number.isFinite(value) || value <= 0) {
    return 100;
  }

  return Math.min(Math.trunc(value), 1000);
}