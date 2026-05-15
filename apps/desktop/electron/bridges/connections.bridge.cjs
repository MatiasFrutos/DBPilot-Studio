"use strict";

const { ipcMain } = require("electron");

const {
  createSuccess,
  createFailure
} = require("../security/ipc.security.cjs");

/*
  Bridge reservado para futuras operaciones específicas de conexiones.

  Por ahora las conexiones se gestionan mediante:
  - storage:read
  - storage:write
  - database:test-connection

  Este archivo queda creado para que la arquitectura no quede corta cuando
  agreguemos cifrado local, import/export de conexiones o perfiles.
*/

function registerConnectionsBridge() {
  ipcMain.handle("connections:health", async () => {
    try {
      return createSuccess({
        ready: true,
        module: "connections.bridge",
        message: "Connections bridge ready"
      });
    } catch (error) {
      return createFailure(error);
    }
  });
}

module.exports = {
  registerConnectionsBridge
};