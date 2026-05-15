export function normalizeIdentifier(identifier) {
  const value = String(identifier || "").trim();

  if (!value) {
    throw new Error("IDENTIFIER_REQUIRED");
  }

  return value;
}

export function quoteIdentifier(identifier, engine = "postgresql") {
  const value = normalizeIdentifier(identifier);

  if (value.includes(".")) {
    return value
      .split(".")
      .map((part) => quoteIdentifier(part, engine))
      .join(".");
  }

  if (engine === "mysql") {
    return `\`${value.replaceAll("`", "``")}\``;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

export function splitQualifiedName(name) {
  const value = String(name || "").trim();

  if (!value) {
    return {
      schema: "",
      table: ""
    };
  }

  const parts = value.split(".");

  if (parts.length === 1) {
    return {
      schema: "",
      table: parts[0]
    };
  }

  return {
    schema: parts[0],
    table: parts.slice(1).join(".")
  };
}

export function isValidIdentifier(identifier) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(identifier || ""));
}