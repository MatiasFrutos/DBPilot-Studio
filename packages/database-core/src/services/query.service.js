import { createDatabaseConnection } from "./connection.service.js";
import { compactSql, getQueryType } from "../utils/sql.util.js";
import { analyzeSqlSafety } from "../safety/sql-safety.guard.js";

export const queryService = {
  async execute(connection, payload = {}) {
    const query = compactSql(payload.query || "");

    if (!query) {
      throw new Error("SQL_QUERY_REQUIRED");
    }

    const safety = analyzeSqlSafety(query, {
      readonly: connection.readonly
    });

    if (!safety.allowed) {
      throw new Error(safety.reason);
    }

    const db = createDatabaseConnection(connection);

    const result = await db.executeQuery({
      query,
      values: payload.values || []
    });

    return {
      ...result,
      safety,
      queryType: getQueryType(query)
    };
  },

  analyzeQuerySafety(query, connection = {}) {
    return analyzeSqlSafety(query, {
      readonly: connection.readonly
    });
  }
};