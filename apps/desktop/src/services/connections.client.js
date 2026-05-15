import { connectionStore, normalizeConnection } from "../store/connection.store.js";
import { storageClient } from "./storage.client.js";
import { databaseClient } from "./database.client.js";
import { validateConnection } from "../utils/validators.util.js";

const CONNECTIONS_STORAGE_KEY = "connections";

export const connectionsClient = {
  async loadConnections() {
    const response = await storageClient.read(CONNECTIONS_STORAGE_KEY, []);

    if (!response.ok) {
      return response;
    }

    const connections = Array.isArray(response.data)
      ? response.data.map(normalizeConnection)
      : [];

    connectionStore.setConnections(connections);

    return {
      ok: true,
      data: connections,
      error: ""
    };
  },

  async saveConnection(connection) {
    const normalizedConnection = normalizeConnection(connection);
    const validation = validateConnection(normalizedConnection);

    if (!validation.ok) {
      return {
        ok: false,
        data: null,
        error: validation.error
      };
    }

    connectionStore.addConnection(normalizedConnection);

    const currentState = connectionStore.getState();

    const response = await storageClient.write(
      CONNECTIONS_STORAGE_KEY,
      currentState.connections
    );

    if (!response.ok) {
      return response;
    }

    return {
      ok: true,
      data: normalizedConnection,
      error: ""
    };
  },

  async removeConnection(connectionId) {
    connectionStore.removeConnection(connectionId);

    const currentState = connectionStore.getState();

    const response = await storageClient.write(
      CONNECTIONS_STORAGE_KEY,
      currentState.connections
    );

    if (!response.ok) {
      return response;
    }

    return {
      ok: true,
      data: {
        id: connectionId
      },
      error: ""
    };
  },

  async testConnection(connection) {
    const normalizedConnection = normalizeConnection(connection);
    const validation = validateConnection(normalizedConnection);

    if (!validation.ok) {
      const failedResult = {
        ok: false,
        data: null,
        error: validation.error
      };

      connectionStore.setLastTestResult(failedResult);

      return failedResult;
    }

    const response = await databaseClient.testConnection(normalizedConnection);

    connectionStore.setLastTestResult(response);

    return response;
  },

  setActiveConnection(connection) {
    const normalizedConnection = connection ? normalizeConnection(connection) : null;

    connectionStore.setActiveConnection(normalizedConnection);

    return {
      ok: true,
      data: normalizedConnection,
      error: ""
    };
  }
};