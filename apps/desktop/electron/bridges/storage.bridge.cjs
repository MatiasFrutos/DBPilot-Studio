"use strict";

const { ipcMain, app } = require("electron");
const fs = require("fs");
const path = require("path");

const {
  assertAllowedChannel,
  sanitizeStorageKey,
  createSuccess,
  createFailure
} = require("../security/ipc.security.cjs");

const STORAGE_FILE_BY_KEY = {
  connections: "connections.json",
  snippets: "snippets.json",
  history: "history.json",
  settings: "settings.json",
  "recent-files": "recent-files.json"
};

function registerStorageBridge() {
  ipcMain.handle("storage:read", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("storage:read");

      const key = sanitizeStorageKey(payload.key);
      const fallbackValue = getFallbackValue(key, payload.fallbackValue);

      const filePath = getStorageFilePath(key);
      ensureStorageFile(filePath, fallbackValue);

      const rawContent = await fs.promises.readFile(filePath, "utf8");
      const data = rawContent.trim() ? JSON.parse(rawContent) : fallbackValue;

      return createSuccess(data);
    } catch (error) {
      return createFailure(error, payload?.fallbackValue ?? null);
    }
  });

  ipcMain.handle("storage:write", async (_event, payload = {}) => {
    try {
      assertAllowedChannel("storage:write");

      const key = sanitizeStorageKey(payload.key);
      const value = payload.value;

      const filePath = getStorageFilePath(key);
      ensureStorageDirectory();

      await fs.promises.writeFile(
        filePath,
        JSON.stringify(value, null, 2),
        "utf8"
      );

      return createSuccess(value);
    } catch (error) {
      return createFailure(error);
    }
  });
}

function getStorageDirectory() {
  const basePath = app.getPath("userData");

  return path.join(basePath, "storage");
}

function ensureStorageDirectory() {
  const storageDirectory = getStorageDirectory();

  if (!fs.existsSync(storageDirectory)) {
    fs.mkdirSync(storageDirectory, {
      recursive: true
    });
  }

  return storageDirectory;
}

function getStorageFilePath(key) {
  const storageDirectory = ensureStorageDirectory();
  const fileName = STORAGE_FILE_BY_KEY[key];

  if (!fileName) {
    throw new Error(`STORAGE_FILE_NOT_CONFIGURED: ${key}`);
  }

  return path.join(storageDirectory, fileName);
}

function ensureStorageFile(filePath, fallbackValue) {
  ensureStorageDirectory();

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(fallbackValue, null, 2),
      "utf8"
    );
  }
}

function getFallbackValue(key, payloadFallback) {
  if (typeof payloadFallback !== "undefined") {
    return payloadFallback;
  }

  const defaults = {
    connections: [],
    snippets: [],
    history: [],
    settings: {
      theme: "dark",
      accent: "blue",
      readonlyMode: false,
      rowLimit: 100,
      confirmDangerousActions: true,
      blockDeleteWithoutWhere: true,
      blockUpdateWithoutWhere: true,
      previewAlterQueries: true
    },
    "recent-files": []
  };

  return defaults[key] ?? null;
}

module.exports = {
  registerStorageBridge
};