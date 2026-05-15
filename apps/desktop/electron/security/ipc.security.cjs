"use strict";

const ALLOWED_STORAGE_KEYS = new Set([
  "connections",
  "snippets",
  "history",
  "settings",
  "recent-files"
]);

const ALLOWED_DATABASE_CHANNELS = new Set([
  "database:test-connection",
  "database:list-tables",
  "database:list-columns",
  "database:get-table-rows",
  "database:execute-query",
  "database:create-table",
  "database:drop-table",
  "database:add-column",
  "database:drop-column",
  "database:preview-create-table",
  "database:preview-add-column"
]);

const ALLOWED_STORAGE_CHANNELS = new Set([
  "storage:read",
  "storage:write"
]);

const ALLOWED_SQLITE_CHANNELS = new Set([
  "sqlite:open-file"
]);

const ALLOWED_EXPORT_CHANNELS = new Set([
  "export:csv",
  "export:markdown"
]);

function assertAllowedChannel(channel) {
  const allowed =
    ALLOWED_DATABASE_CHANNELS.has(channel) ||
    ALLOWED_STORAGE_CHANNELS.has(channel) ||
    ALLOWED_SQLITE_CHANNELS.has(channel) ||
    ALLOWED_EXPORT_CHANNELS.has(channel);

  if (!allowed) {
    throw new Error(`IPC_CHANNEL_NOT_ALLOWED: ${channel}`);
  }

  return true;
}

function assertAllowedStorageKey(key) {
  if (!ALLOWED_STORAGE_KEYS.has(key)) {
    throw new Error(`STORAGE_KEY_NOT_ALLOWED: ${key}`);
  }

  return true;
}

function sanitizeStorageKey(key) {
  const safeKey = String(key || "").trim();

  assertAllowedStorageKey(safeKey);

  return safeKey;
}

function sanitizeFileName(filename, fallback = "dbpilot-export.txt") {
  const value = String(filename || fallback).trim();

  if (!value) {
    return fallback;
  }

  return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

function normalizeIpcError(error) {
  if (!error) {
    return "Error desconocido.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Error desconocido.";
  }
}

function createSuccess(data = null) {
  return {
    ok: true,
    data,
    error: ""
  };
}

function createFailure(error, data = null) {
  return {
    ok: false,
    data,
    error: normalizeIpcError(error)
  };
}

module.exports = {
  ALLOWED_STORAGE_KEYS,
  ALLOWED_DATABASE_CHANNELS,
  ALLOWED_STORAGE_CHANNELS,
  ALLOWED_SQLITE_CHANNELS,
  ALLOWED_EXPORT_CHANNELS,
  assertAllowedChannel,
  assertAllowedStorageKey,
  sanitizeStorageKey,
  sanitizeFileName,
  normalizeIpcError,
  createSuccess,
  createFailure
};