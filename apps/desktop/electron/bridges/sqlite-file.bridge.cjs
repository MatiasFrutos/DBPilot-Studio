"use strict";

const { ipcMain, dialog } = require("electron");

const {
  assertAllowedChannel,
  createSuccess,
  createFailure
} = require("../security/ipc.security.cjs");

function registerSqliteFileBridge(mainWindowGetter) {
  ipcMain.handle("sqlite:open-file", async () => {
    try {
      assertAllowedChannel("sqlite:open-file");

      const mainWindow =
        typeof mainWindowGetter === "function" ? mainWindowGetter() : null;

      const result = await dialog.showOpenDialog(mainWindow, {
        title: "Abrir base SQLite",
        properties: ["openFile"],
        filters: [
          {
            name: "SQLite Database",
            extensions: ["db", "sqlite", "sqlite3"]
          },
          {
            name: "Todos los archivos",
            extensions: ["*"]
          }
        ]
      });

      if (result.canceled || !result.filePaths.length) {
        return createSuccess({
          canceled: true,
          filePath: ""
        });
      }

      return createSuccess({
        canceled: false,
        filePath: result.filePaths[0]
      });
    } catch (error) {
      return createFailure(error);
    }
  });
}

module.exports = {
  registerSqliteFileBridge
};