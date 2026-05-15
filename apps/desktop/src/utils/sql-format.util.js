const SQL_KEYWORDS = [
  "select",
  "from",
  "where",
  "join",
  "left join",
  "right join",
  "inner join",
  "outer join",
  "group by",
  "order by",
  "having",
  "limit",
  "offset",
  "insert into",
  "values",
  "update",
  "set",
  "delete from",
  "create table",
  "alter table",
  "drop table",
  "add column",
  "drop column"
];

export function formatSql(sql) {
  let formattedSql = String(sql || "").trim();

  if (!formattedSql) {
    return "";
  }

  formattedSql = formattedSql.replace(/\s+/g, " ");

  SQL_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi");
    formattedSql = formattedSql.replace(regex, (match) => `\n${match.toUpperCase()}`);
  });

  formattedSql = formattedSql
    .replace(/^\n/, "")
    .replace(/\s*,\s*/g, ",\n  ")
    .replace(/\(\s*/g, "(")
    .replace(/\s*\)/g, ")")
    .trim();

  if (!formattedSql.endsWith(";")) {
    formattedSql += ";";
  }

  return formattedSql;
}

export function compactSql(sql) {
  return String(sql || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSelectQuery(sql) {
  return compactSql(sql).toLowerCase().startsWith("select ");
}

export function isDeleteWithoutWhere(sql) {
  const compact = compactSql(sql).toLowerCase();

  return compact.startsWith("delete from ") && !compact.includes(" where ");
}

export function isUpdateWithoutWhere(sql) {
  const compact = compactSql(sql).toLowerCase();

  return compact.startsWith("update ") && !compact.includes(" where ");
}

export function isDangerousQuery(sql) {
  const compact = compactSql(sql).toLowerCase();

  return (
    compact.startsWith("drop table ") ||
    compact.startsWith("drop database ") ||
    compact.startsWith("truncate table ") ||
    compact.includes(" drop table ") ||
    compact.includes(" truncate table ")
  );
}

export function isStructureQuery(sql) {
  const compact = compactSql(sql).toLowerCase();

  return (
    compact.startsWith("create table ") ||
    compact.startsWith("alter table ") ||
    compact.startsWith("drop table ")
  );
}

export function getQueryType(sql) {
  const compact = compactSql(sql).toLowerCase();

  if (compact.startsWith("select ")) return "SELECT";
  if (compact.startsWith("insert ")) return "INSERT";
  if (compact.startsWith("update ")) return "UPDATE";
  if (compact.startsWith("delete ")) return "DELETE";
  if (compact.startsWith("create ")) return "CREATE";
  if (compact.startsWith("alter ")) return "ALTER";
  if (compact.startsWith("drop ")) return "DROP";
  if (compact.startsWith("truncate ")) return "TRUNCATE";

  return "SQL";
}

export function buildLimitQuery(sql, limit = 100) {
  const compact = compactSql(sql);
  const normalizedLimit = Number(limit);

  if (!isSelectQuery(compact)) {
    return compact;
  }

  if (/\blimit\s+\d+/i.test(compact)) {
    return compact;
  }

  return `${compact.replace(/;$/, "")} LIMIT ${
    Number.isFinite(normalizedLimit) ? normalizedLimit : 100
  };`;
}

export function createSafePreview(sql) {
  return {
    raw: String(sql || ""),
    compact: compactSql(sql),
    formatted: formatSql(sql),
    type: getQueryType(sql),
    selectOnly: isSelectQuery(sql),
    dangerous: isDangerousQuery(sql),
    deleteWithoutWhere: isDeleteWithoutWhere(sql),
    updateWithoutWhere: isUpdateWithoutWhere(sql),
    structure: isStructureQuery(sql)
  };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}