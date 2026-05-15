import { storageClient } from "./storage.client.js";

const SNIPPETS_STORAGE_KEY = "snippets";

export const snippetsClient = {
  async loadSnippets() {
    const response = await storageClient.read(SNIPPETS_STORAGE_KEY, []);

    if (!response.ok) {
      return response;
    }

    return {
      ok: true,
      data: Array.isArray(response.data) ? response.data.map(normalizeSnippet) : [],
      error: ""
    };
  },

  async saveSnippet(snippet = {}) {
    const currentResponse = await this.loadSnippets();

    if (!currentResponse.ok) {
      return currentResponse;
    }

    const normalizedSnippet = normalizeSnippet(snippet);
    const exists = currentResponse.data.some((item) => item.id === normalizedSnippet.id);

    const nextSnippets = exists
      ? currentResponse.data.map((item) =>
          item.id === normalizedSnippet.id ? normalizedSnippet : item
        )
      : [normalizedSnippet, ...currentResponse.data];

    const writeResponse = await storageClient.write(SNIPPETS_STORAGE_KEY, nextSnippets);

    if (!writeResponse.ok) {
      return writeResponse;
    }

    return {
      ok: true,
      data: normalizedSnippet,
      error: ""
    };
  },

  async deleteSnippet(snippetId) {
    const currentResponse = await this.loadSnippets();

    if (!currentResponse.ok) {
      return currentResponse;
    }

    const nextSnippets = currentResponse.data.filter((item) => item.id !== snippetId);

    return storageClient.write(SNIPPETS_STORAGE_KEY, nextSnippets);
  }
};

export function normalizeSnippet(snippet = {}) {
  return {
    id: snippet.id || createId("snippet"),
    title: snippet.title || "Snippet sin título",
    category: snippet.category || "General",
    engine: snippet.engine || "any",
    sql: snippet.sql || "",
    notes: snippet.notes || "",
    createdAt: snippet.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}