"use strict";

const { ipcMain, dialog } = require("electron");
const fs = require("fs");

const {
  assertAllowedChannel,
  sanitizeFileName,
  createSuccess,
  createFailure
} = require("../security/ipc.security.cjs");

function registerExportBridge(mainWindowGetter) {
  ipcMain.handle("export:csv", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("export:csv");

      const filename = sanitizeFileName(payload.filename, "dbpilot-export.csv");
      const rows = Array.isArray(payload.rows) ? payload.rows : [];
      const csvText = toCsvText(rows);

      const savedFile = await saveTextFile({
        mainWindowGetter,
        title: "Exportar CSV",
        defaultPath: filename,
        filters: [
          {
            name: "CSV",
            extensions: ["csv"]
          }
        ],
        content: csvText
      });

      return createSuccess(savedFile);
    } catch (error) {
      return createFailure(error);
    }
  });

  ipcMain.handle("export:markdown", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("export:markdown");

      const filename = sanitizeFileName(payload.filename, "dbpilot-report.md");
      const markdown = String(payload.markdown || "");

      const savedFile = await saveTextFile({
        mainWindowGetter,
        title: "Exportar Markdown",
        defaultPath: filename,
        filters: [
          {
            name: "Markdown",
            extensions: ["md"]
          }
        ],
        content: markdown
      });

      return createSuccess(savedFile);
    } catch (error) {
      return createFailure(error);
    }
  });
}

async function saveTextFile({
  mainWindowGetter,
  title,
  defaultPath,
  filters,
  content
}) {
  const mainWindow =
    typeof mainWindowGetter === "function" ? mainWindowGetter() : null;

  const result = await dialog.showSaveDialog(mainWindow, {
    title,
    defaultPath,
    filters
  });

  if (result.canceled || !result.filePath) {
    return {
      canceled: true,
      filePath: "",
      bytes: 0
    };
  }

  await fs.promises.writeFile(result.filePath, content, "utf8");

  return {
    canceled: false,
    filePath: result.filePath,
    bytes: Buffer.byteLength(content, "utf8")
  };
}

function toCsvText(rows = []) {
  if (!Array.isArray(rows) || !rows.length) {
    return "";
  }

  const columns = Object.keys(rows[0]);
  const header = columns.map(escapeCsvValue).join(",");

  const body = rows.map((row) => {
    return columns.map((column) => escapeCsvValue(row[column])).join(",");
  });

  return [header, ...body].join("\n");
}

function escapeCsvValue(value) {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  const escapedText = text.replaceAll('"', '""');

  if (/[",\n\r]/.test(escapedText)) {
    return `"${escapedText}"`;
  }

  return escapedText;
}

module.exports = {
  registerExportBridge
};