"use strict";

const { Menu, app } = require("electron");

function setupApplicationMenu() {
  const template = [
    {
      label: "DBPilot Studio",
      submenu: [
        {
          label: "Acerca de DBPilot Studio",
          role: "about"
        },
        {
          type: "separator"
        },
        {
          label: "Salir",
          accelerator: "Alt+F4",
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Editar",
      submenu: [
        {
          label: "Deshacer",
          role: "undo"
        },
        {
          label: "Rehacer",
          role: "redo"
        },
        {
          type: "separator"
        },
        {
          label: "Cortar",
          role: "cut"
        },
        {
          label: "Copiar",
          role: "copy"
        },
        {
          label: "Pegar",
          role: "paste"
        },
        {
          label: "Seleccionar todo",
          role: "selectAll"
        }
      ]
    },
    {
      label: "Vista",
      submenu: [
        {
          label: "Recargar",
          role: "reload"
        },
        {
          label: "Forzar recarga",
          role: "forceReload"
        },
        {
          label: "Herramientas de desarrollo",
          role: "toggleDevTools"
        },
        {
          type: "separator"
        },
        {
          label: "Pantalla completa",
          role: "togglefullscreen"
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = {
  setupApplicationMenu
};