import {
  compactSql,
  getQueryType,
  isDangerousQuery,
  isDeleteWithoutWhere,
  isUpdateWithoutWhere
} from "../utils/sql.util.js";

export function analyzeSqlSafety(sql, options = {}) {
  const query = compactSql(sql);
  const queryType = getQueryType(query);
  const readonly = Boolean(options.readonly);

  if (!query) {
    return {
      allowed: false,
      reason: "SQL_QUERY_REQUIRED",
      dangerous: false,
      queryType
    };
  }

  if (readonly && queryType !== "SELECT") {
    return {
      allowed: false,
      reason: "READONLY_MODE_BLOCKED_WRITE_OPERATION",
      dangerous: true,
      queryType
    };
  }

  if (isDeleteWithoutWhere(query)) {
    return {
      allowed: false,
      reason: "DELETE_WITHOUT_WHERE_BLOCKED",
      dangerous: true,
      queryType
    };
  }

  if (isUpdateWithoutWhere(query)) {
    return {
      allowed: false,
      reason: "UPDATE_WITHOUT_WHERE_BLOCKED",
      dangerous: true,
      queryType
    };
  }

  if (isDangerousQuery(query)) {
    return {
      allowed: false,
      reason: "DANGEROUS_QUERY_REQUIRES_CONFIRMATION",
      dangerous: true,
      queryType
    };
  }

  return {
    allowed: true,
    reason: "",
    dangerous: false,
    queryType
  };
}

export function assertSqlSafe(sql, options = {}) {
  const safety = analyzeSqlSafety(sql, options);

  if (!safety.allowed) {
    throw new Error(safety.reason);
  }

  return safety;
}