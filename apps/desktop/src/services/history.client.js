import { storageClient } from "./storage.client.js";

const HISTORY_STORAGE_KEY = "history";

export const historyClient = {
  async loadHistory() {
    const response = await storageClient.read(HISTORY_STORAGE_KEY, []);

    if (!response.ok) {
      return response;
    }

    return {
      ok: true,
      data: Array.isArray(response.data) ? response.data : [],
      error: ""
    };
  },

  async addHistoryItem(item = {}) {
    const currentResponse = await this.loadHistory();

    if (!currentResponse.ok) {
      return currentResponse;
    }

    const nextItem = normalizeHistoryItem(item);
    const nextHistory = [nextItem, ...currentResponse.data].slice(0, 300);

    const writeResponse = await storageClient.write(HISTORY_STORAGE_KEY, nextHistory);

    if (!writeResponse.ok) {
      return writeResponse;
    }

    return {
      ok: true,
      data: nextItem,
      error: ""
    };
  },

  async clearHistory() {
    return storageClient.write(HISTORY_STORAGE_KEY, []);
  }
};

export function normalizeHistoryItem(item = {}) {
  return {
    id: item.id || createId("history"),
    type: item.type || "ACTION",
    status: item.status || "success",
    connectionName: item.connectionName || "",
    engine: item.engine || "",
    query: item.query || "",
    detail: item.detail || "",
    durationMs: Number(item.durationMs || 0),
    createdAt: item.createdAt || new Date().toISOString()
  };
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}