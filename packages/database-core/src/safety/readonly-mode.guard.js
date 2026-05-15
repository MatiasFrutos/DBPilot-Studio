import { getQueryType } from "../utils/sql.util.js";

export function assertReadonlyAllowsQuery(sql, readonly = false) {
  if (!readonly) {
    return true;
  }

  const queryType = getQueryType(sql);

  if (queryType !== "SELECT") {
    throw new Error("READONLY_MODE_BLOCKED_WRITE_OPERATION");
  }

  return true;
}

export function assertReadonlyAllowsStructureChange(readonly = false) {
  if (readonly) {
    throw new Error("READONLY_MODE_BLOCKED_STRUCTURE_OPERATION");
  }

  return true;
}