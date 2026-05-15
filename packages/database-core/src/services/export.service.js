import { normalizeRows } from "../utils/result-normalizer.util.js";

export const exportService = {
  toCsv(rows = []) {
    return toCsvText(rows);
  },

  toJson(data = []) {
    return JSON.stringify(data, null, 2);
  },

  toMarkdownTable(rows = []) {
    return toMarkdownTable(rows);
  }
};

export function toCsvText(rows = []) {
  const normalizedRows = normalizeRows(rows);

  if (!normalizedRows.length) {
    return "";
  }

  const columns = Object.keys(normalizedRows[0]);
  const header = columns.map(escapeCsvValue).join(",");

  const body = normalizedRows.map((row) => {
    return columns.map((column) => escapeCsvValue(row[column])).join(",");
  });

  return [header, ...body].join("\n");
}

export function toMarkdownTable(rows = []) {
  const normalizedRows = normalizeRows(rows);

  if (!normalizedRows.length) {
    return "";
  }

  const columns = Object.keys(normalizedRows[0]);

  const header = `| ${columns.join(" | ")} |`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |`;

  const body = normalizedRows.map((row) => {
    return `| ${columns.map((column) => sanitizeMarkdownCell(row[column])).join(" | ")} |`;
  });

  return [header, separator, ...body].join("\n");
}

function escapeCsvValue(value) {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  const escapedText = text.replaceAll('"', '""');

  if (/[",\n\r]/.test(escapedText)) {
    return `"${escapedText}"`;
  }

  return escapedText;
}

function sanitizeMarkdownCell(value) {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  return String(value)
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .replaceAll("\r", " ");
}