import { normalizeError } from "../utils/validators.util.js";
import { toCsvText, toJsonText, downloadTextFile } from "../utils/format.util.js";

export const exportClient = {
  async exportCsv({ filename = "dbpilot-export.csv", rows = [] } = {}) {
    try {
      if (hasExportBridge("toCsv")) {
        const response = await window.dbpilot.export.toCsv({
          filename,
          rows
        });

        return normalizeResponse(response);
      }

      const csv = toCsvText(rows);
      downloadTextFile(filename, csv, "text/csv;charset=utf-8");

      return {
        ok: true,
        data: {
          filename,
          rows: rows.length
        },
        error: ""
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: normalizeError(error)
      };
    }
  },

  async exportJson({ filename = "dbpilot-export.json", data = [] } = {}) {
    try {
      const json = toJsonText(data);
      downloadTextFile(filename, json, "application/json;charset=utf-8");

      return {
        ok: true,
        data: {
          filename
        },
        error: ""
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: normalizeError(error)
      };
    }
  },

  async exportMarkdown({ filename = "dbpilot-report.md", markdown = "" } = {}) {
    try {
      if (hasExportBridge("toMarkdown")) {
        const response = await window.dbpilot.export.toMarkdown({
          filename,
          markdown
        });

        return normalizeResponse(response);
      }

      downloadTextFile(filename, markdown, "text/markdown;charset=utf-8");

      return {
        ok: true,
        data: {
          filename
        },
        error: ""
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: normalizeError(error)
      };
    }
  }
};

function hasExportBridge(methodName) {
  return (
    typeof window !== "undefined" &&
    window.dbpilot &&
    window.dbpilot.export &&
    typeof window.dbpilot.export[methodName] === "function"
  );
}

function normalizeResponse(response) {
  if (!response) {
    return {
      ok: false,
      data: null,
      error: "Respuesta vacía desde el bridge de exportación."
    };
  }

  if (typeof response.ok === "boolean") {
    return response;
  }

  return {
    ok: true,
    data: response,
    error: ""
  };
}