export function formatNumber(value, locale = "es-AR") {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat(locale).format(number);
}

export function formatDateTime(value, locale = "es-AR") {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatBytes(bytes) {
  const number = Number(bytes);

  if (!Number.isFinite(number) || number <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(number) / Math.log(1024)),
    units.length - 1
  );

  const value = number / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function truncateText(value, maxLength = 80) {
  const text = String(value || "");

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

export function toCsvText(rows = []) {
  if (!Array.isArray(rows) || !rows.length) {
    return "";
  }

  const columns = Object.keys(rows[0]);

  const header = columns.map(escapeCsvValue).join(",");

  const body = rows.map((row) => {
    return columns
      .map((column) => escapeCsvValue(row[column]))
      .join(",");
  });

  return [header, ...body].join("\n");
}

export function toJsonText(data) {
  return JSON.stringify(data, null, 2);
}

export function downloadTextFile(filename, text, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([text], {
    type: mimeType
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function createMarkdownTable(rows = []) {
  if (!Array.isArray(rows) || !rows.length) {
    return "";
  }

  const columns = Object.keys(rows[0]);

  const header = `| ${columns.join(" | ")} |`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |`;

  const body = rows.map((row) => {
    return `| ${columns.map((column) => sanitizeMarkdownCell(row[column])).join(" | ")} |`;
  });

  return [header, separator, ...body].join("\n");
}

function escapeCsvValue(value) {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  const text = typeof value === "object"
    ? JSON.stringify(value)
    : String(value);

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