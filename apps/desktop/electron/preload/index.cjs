"use strict";

const { contextBridge, ipcRenderer } = require("electron");

const ALLOWED_DATABASE_CHANNELS = {
  testConnection: "database:test-connection",
  listTables: "database:list-tables",
  listColumns: "database:list-columns",
  getTableRows: "database:get-table-rows",
  executeQuery: "database:execute-query",
  createTable: "database:create-table",
  dropTable: "database:drop-table",
  addColumn: "database:add-column",
  dropColumn: "database:drop-column",
  previewCreateTable: "database:preview-create-table",
  previewAddColumn: "database:preview-add-column"
};

const ALLOWED_STORAGE_CHANNELS = {
  read: "storage:read",
  write: "storage:write"
};

const ALLOWED_SQLITE_CHANNELS = {
  openFile: "sqlite:open-file"
};

const ALLOWED_EXPORT_CHANNELS = {
  toCsv: "export:csv",
  toMarkdown: "export:markdown"
};

contextBridge.exposeInMainWorld("dbpilot", {
  app: {
    ping() {
      return "Bridge activo";
    },

    platform() {
      return process.platform;
    }
  },

  database: {
    testConnection(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.testConnection,
        sanitizePayload(payload)
      );
    },

    listTables(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.listTables,
        sanitizePayload(payload)
      );
    },

    listColumns(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.listColumns,
        sanitizePayload(payload)
      );
    },

    getTableRows(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.getTableRows,
        sanitizePayload(payload)
      );
    },

    executeQuery(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.executeQuery,
        sanitizePayload(payload)
      );
    },

    createTable(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.createTable,
        sanitizePayload(payload)
      );
    },

    dropTable(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.dropTable,
        sanitizePayload(payload)
      );
    },

    addColumn(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.addColumn,
        sanitizePayload(payload)
      );
    },

    dropColumn(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.dropColumn,
        sanitizePayload(payload)
      );
    },

    previewCreateTable(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.previewCreateTable,
        sanitizePayload(payload)
      );
    },

    previewAddColumn(payload) {
      return ipcRenderer.invoke(
        ALLOWED_DATABASE_CHANNELS.previewAddColumn,
        sanitizePayload(payload)
      );
    }
  },

  storage: {
    read(payload) {
      return ipcRenderer.invoke(
        ALLOWED_STORAGE_CHANNELS.read,
        sanitizePayload(payload)
      );
    },

    write(payload) {
      return ipcRenderer.invoke(
        ALLOWED_STORAGE_CHANNELS.write,
        sanitizePayload(payload)
      );
    }
  },

  sqlite: {
    openFile() {
      return ipcRenderer.invoke(ALLOWED_SQLITE_CHANNELS.openFile);
    }
  },

  export: {
    toCsv(payload) {
      return ipcRenderer.invoke(
        ALLOWED_EXPORT_CHANNELS.toCsv,
        sanitizePayload(payload)
      );
    },

    toMarkdown(payload) {
      return ipcRenderer.invoke(
        ALLOWED_EXPORT_CHANNELS.toMarkdown,
        sanitizePayload(payload)
      );
    }
  }
});

function sanitizePayload(payload) {
  if (payload === null || typeof payload === "undefined") {
    return {};
  }

  if (typeof payload !== "object") {
    return {
      value: payload
    };
  }

  return JSON.parse(JSON.stringify(payload));
}