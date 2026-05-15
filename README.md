<!-- =========================================================
     DBPilot Studio README
     Desarrollo realizado por Matias Isaac Frutos Gonzalez
     ========================================================= -->

<div align="center">

# 🧭 DBPilot Studio

### ⚡ Desktop Database Explorer & Editor

<p>
  Herramienta desktop local para explorar, consultar, editar y documentar bases de datos desde una interfaz moderna, rápida y segura.
</p>

<p>
  <img src="https://img.shields.io/badge/status-MVP%20real-brightgreen" />
  <img src="https://img.shields.io/badge/desktop-Electron-47848F" />
  <img src="https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB" />
  <img src="https://img.shields.io/badge/runtime-Node.js-339933" />
  <img src="https://img.shields.io/badge/database-PostgreSQL%20%7C%20MySQL%20%7C%20SQLite-blue" />
  <img src="https://img.shields.io/badge/license-MIT-black" />
</p>

<br>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=900&color=38BDF8&center=true&vCenter=true&width=950&lines=Explore+databases+locally;Inspect+tables%2C+columns+and+schemas;Run+SQL+queries+safely;Edit+database+structure;Export+CSV%2C+JSON+and+Markdown+reports;Built+for+developers+and+IT+teams" />

</div>

---

## 📌 Overview

**DBPilot Studio** es una aplicación desktop local pensada para desarrolladores, técnicos IT, administradores de sistemas y equipos que trabajan con bases de datos todos los días.

El objetivo es simple: tener una herramienta liviana, clara y profesional para conectarse a bases **PostgreSQL**, **MySQL / MariaDB** y archivos **SQLite**, inspeccionar su estructura, ejecutar consultas SQL, editar columnas, crear tablas, exportar información y generar documentación técnica.

No es solo una maqueta visual.  
Es una base funcional para convertirla en un producto real de productividad técnica.

---

## 🎯 ¿Para qué sirve?

DBPilot Studio sirve para centralizar tareas comunes de administración y análisis de bases de datos sin depender de herramientas pesadas o demasiado corporativas.

Permite:

- 🔌 Conectar bases PostgreSQL.
- 🐬 Conectar bases MySQL / MariaDB.
- 🗂️ Abrir archivos SQLite locales.
- 🧱 Ver schemas, tablas y vistas.
- 🔎 Inspeccionar columnas, tipos, claves primarias y valores por defecto.
- 📊 Visualizar registros de tablas.
- 🧠 Ejecutar consultas SQL.
- ➕ Crear tablas.
- 🧩 Agregar columnas.
- 🗑️ Eliminar columnas con confirmación escrita.
- ⚠️ Eliminar tablas con confirmación escrita.
- 💾 Guardar snippets SQL.
- 🕘 Registrar historial local.
- 📤 Exportar datos en CSV.
- 📦 Exportar datos en JSON.
- 📝 Exportar reportes Markdown.
- 📚 Generar documentación técnica de la estructura de una base.

---

## 🧠 Problema que resuelve

Muchas herramientas para bases de datos son potentes, pero también pueden ser pesadas, lentas o demasiado complejas para tareas rápidas.

DBPilot Studio resuelve ese cuello de botella operativo:

    Necesito ver una base.
    Necesito entender sus tablas.
    Necesito ejecutar una consulta.
    Necesito modificar estructura.
    Necesito documentar lo que existe.
    Necesito hacerlo rápido, local y sin fricción.

La idea es que el usuario técnico pueda entrar, conectar, revisar, editar y salir con información clara. Sin reuniones con la base de datos, porque la base ya tiene bastante carácter.

---

## 🏗️ Arquitectura general

    DBPilot Studio
    │
    ├── Electron Desktop App
    │   ├── Main Process
    │   ├── Preload
    │   ├── Secure IPC Bridges
    │   └── Local Window Manager
    │
    ├── React Frontend
    │   ├── Dashboard
    │   ├── Connections
    │   ├── Explorer
    │   ├── SQL Runner
    │   ├── Structure Editor
    │   ├── Snippets
    │   ├── History
    │   ├── Reports
    │   └── Settings
    │
    ├── Database Core
    │   ├── PostgreSQL Driver
    │   ├── MySQL / MariaDB Driver
    │   ├── SQLite Driver
    │   ├── Schema Services
    │   ├── Query Services
    │   ├── Structure Builder
    │   └── Safety Layer
    │
    └── Local Storage
        ├── Connections
        ├── Snippets
        ├── History
        ├── Reports
        └── Settings

---

## 🧰 Tecnologías utilizadas

| Área | Tecnología |
|---|---|
| Desktop | Electron |
| Frontend | React |
| Build Tool | Vite |
| Lenguaje | JavaScript |
| Runtime | Node.js |
| PostgreSQL | pg |
| MySQL / MariaDB | mysql2 |
| SQLite | better-sqlite3 |
| Comunicación interna | IPC + contextBridge |
| Storage local | JSON en userData |
| Exportación | CSV, JSON, Markdown |
| Estilos | CSS propio modular |

---

## 🗄️ Bases de datos soportadas

### 🐘 PostgreSQL

Conexión mediante:

    Host
    Puerto
    Usuario
    Contraseña
    Nombre de base

---

### 🐬 MySQL / MariaDB

Conexión mediante:

    Host
    Puerto
    Usuario
    Contraseña
    Nombre de base

---

### 🗂️ SQLite

Apertura directa de archivos locales:

    .db
    .sqlite
    .sqlite3

---

## ⚠️ Aclaración importante

    PostgreSQL y MySQL NO se abren como archivo.
    Se conectan mediante servidor, host, puerto y credenciales.

    SQLite SÍ se abre como archivo local.

---

## ✨ Funcionalidades principales

### 🔌 1. Gestión de conexiones

Permite guardar conexiones locales para acceder rápido a bases usadas frecuentemente.

Incluye:

- Crear conexión.
- Editar conexión.
- Eliminar conexión.
- Probar conexión.
- Guardar conexiones en storage local.
- Diferenciar motor PostgreSQL, MySQL y SQLite.

---

### 🧭 2. Database Explorer

Permite navegar la estructura de la base.

Incluye:

- Listado de schemas.
- Listado de tablas.
- Listado de vistas.
- Vista de columnas.
- Tipos de datos.
- Primary keys.
- Defaults.
- Nullable / Not nullable.
- Cantidad aproximada de registros.

---

### 📊 3. Visualización de datos

Permite abrir una tabla y ver sus registros.

Incluye:

- Vista tipo tabla.
- Carga inicial de registros.
- Lectura segura.
- Separación entre estructura y datos.
- Base preparada para filtros y paginación real.

---

### 🧠 4. SQL Runner

Permite ejecutar consultas SQL desde la app.

Incluye:

- Editor SQL.
- Ejecución de consultas.
- Resultado en tabla.
- Manejo de errores.
- Historial local.
- Snippets reutilizables.
- Validación básica de queries peligrosas.

Ejemplo:

    SELECT *
    FROM users
    LIMIT 50;

---

### 🧱 5. Editor de estructura

Permite modificar la estructura de la base con controles de seguridad.

Incluye:

- Crear tablas.
- Agregar columnas.
- Eliminar columnas.
- Eliminar tablas.
- Confirmación escrita para operaciones destructivas.
- Modo solo lectura.
- Validaciones previas.

---

### 💾 6. Snippets SQL

Permite guardar consultas frecuentes.

Ejemplos:

    SELECT * FROM clientes LIMIT 50;

    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public';

Incluye:

- Crear snippet.
- Editar snippet.
- Eliminar snippet.
- Ejecutar snippet.
- Persistencia local.

---

### 🕘 7. Historial

Registra acciones importantes realizadas dentro de la app.

Puede guardar:

- Consultas ejecutadas.
- Conexiones usadas.
- Tablas abiertas.
- Operaciones estructurales.
- Exportaciones realizadas.

---

### 📤 8. Exportaciones

Permite exportar información en formatos útiles para trabajo técnico.

Formatos soportados:

    CSV
    JSON
    Markdown

Casos de uso:

- Exportar registros.
- Exportar resultado de una consulta.
- Exportar estructura.
- Generar documentación técnica.

---

### 📝 9. Reportes Markdown

Permite generar documentación legible de la base.

Ejemplo de salida:

    # Database Report

    ## Tables

    ### users

    | Column | Type | Nullable | Default |
    |---|---|---|---|
    | id | integer | NO | nextval |
    | email | varchar | NO | null |
    | created_at | timestamp | YES | now() |

---

### ⚙️ 10. Settings

Permite administrar comportamiento general de la app.

Incluye:

- Modo solo lectura.
- Preferencias visuales.
- Configuración local.
- Estado persistente.
- Base para futuras opciones avanzadas.

---

## 🔐 Seguridad

DBPilot Studio está pensado con una capa de seguridad desde el inicio.

Incluye:

- IPC controlado entre frontend y Electron.
- Uso de preload y contextBridge.
- Canales permitidos.
- Validación de claves de storage.
- Bloqueo de queries peligrosas.
- Confirmación escrita para acciones destructivas.
- Modo solo lectura.
- Separación entre UI y core de base de datos.

Operaciones como eliminar una tabla o columna deben confirmarse manualmente para evitar accidentes.

Porque una base de datos no perdona un “ups”.

---

## 📁 Estructura del proyecto

    dbpilot-studio/
    │
    ├── apps/
    │   └── desktop/
    │       ├── electron/
    │       │   ├── main/
    │       │   │   └── index.cjs
    │       │   │
    │       │   ├── preload/
    │       │   │   └── index.cjs
    │       │   │
    │       │   ├── bridges/
    │       │   │   ├── database.bridge.cjs
    │       │   │   ├── storage.bridge.cjs
    │       │   │   └── system.bridge.cjs
    │       │   │
    │       │   └── security/
    │       │       ├── allowed-channels.cjs
    │       │       └── validate-ipc.cjs
    │       │
    │       ├── src/
    │       │   ├── app/
    │       │   │   └── App.jsx
    │       │   │
    │       │   ├── layouts/
    │       │   │   └── AppShell.jsx
    │       │   │
    │       │   ├── components/
    │       │   │   ├── sidebar/
    │       │   │   ├── topbar/
    │       │   │   ├── cards/
    │       │   │   ├── modals/
    │       │   │   └── table/
    │       │   │
    │       │   ├── pages/
    │       │   │   ├── dashboard/
    │       │   │   ├── connections/
    │       │   │   ├── explorer/
    │       │   │   ├── sql-runner/
    │       │   │   ├── structure-editor/
    │       │   │   ├── snippets/
    │       │   │   ├── history/
    │       │   │   ├── reports/
    │       │   │   └── settings/
    │       │   │
    │       │   ├── services/
    │       │   │   ├── database.client.js
    │       │   │   ├── storage.client.js
    │       │   │   └── export.client.js
    │       │   │
    │       │   ├── store/
    │       │   │   ├── app.store.js
    │       │   │   ├── connection.store.js
    │       │   │   └── explorer.store.js
    │       │   │
    │       │   ├── utils/
    │       │   │   ├── format.js
    │       │   │   ├── validators.js
    │       │   │   └── constants.js
    │       │   │
    │       │   ├── styles/
    │       │   │   ├── global.css
    │       │   │   ├── shell.css
    │       │   │   ├── components.css
    │       │   │   └── pages.css
    │       │   │
    │       │   └── main.jsx
    │       │
    │       ├── index.html
    │       ├── package.json
    │       └── vite.config.js
    │
    ├── packages/
    │   └── database-core/
    │       ├── src/
    │       │   ├── drivers/
    │       │   │   ├── postgres.driver.js
    │       │   │   ├── mysql.driver.js
    │       │   │   └── sqlite.driver.js
    │       │   │
    │       │   ├── services/
    │       │   │   ├── connection.service.js
    │       │   │   ├── schema.service.js
    │       │   │   ├── table.service.js
    │       │   │   └── query.service.js
    │       │   │
    │       │   ├── builders/
    │       │   │   ├── create-table.builder.js
    │       │   │   └── alter-table.builder.js
    │       │   │
    │       │   ├── safety/
    │       │   │   ├── query-guard.js
    │       │   │   └── destructive-actions.js
    │       │   │
    │       │   └── utils/
    │       │       ├── normalize.js
    │       │       └── errors.js
    │       │
    │       └── package.json
    │
    ├── storage/
    ├── docs/
    ├── scripts/
    ├── package.json
    ├── README.md
    ├── .gitignore
    └── LICENSE

---

## ⚙️ Instalación

### 1. Clonar el repositorio

    git clone https://github.com/tu-usuario/dbpilot-studio.git

### 2. Entrar al proyecto

    cd dbpilot-studio

### 3. Instalar dependencias

    npm install

### 4. Levantar en desarrollo

    npm run dev

---

## 🚀 Comandos principales

    npm install

Instala todas las dependencias del proyecto.

    npm run dev

Levanta la aplicación en modo desarrollo con Vite + Electron.

    npm run build

Compila el frontend para producción.

    npm run start

Ejecuta la app en modo producción/local.

---

## 🧪 Flujo de uso

    1. Abrir DBPilot Studio.
    2. Crear una conexión nueva.
    3. Elegir motor: PostgreSQL, MySQL/MariaDB o SQLite.
    4. Probar conexión.
    5. Guardar conexión.
    6. Abrir Explorer.
    7. Seleccionar schema o tabla.
    8. Ver columnas, tipos y datos.
    9. Ejecutar SQL desde SQL Runner.
    10. Exportar resultados o generar documentación.

---

## 🖥️ Vista conceptual

    ┌─────────────────────────────────────────────────────────────┐
    │ DBPilot Studio                                      Settings │
    ├───────────────┬─────────────────────────────────────────────┤
    │ Dashboard     │                                             │
    │ Connections   │      Database Explorer                      │
    │ Explorer      │                                             │
    │ SQL Runner    │      Tables / Columns / Data / SQL          │
    │ Structure     │                                             │
    │ Snippets      │      Safe actions + local history           │
    │ History       │                                             │
    │ Reports       │                                             │
    └───────────────┴─────────────────────────────────────────────┘

---

## 🧩 Módulos del MVP

| Módulo | Estado | Descripción |
|---|---:|---|
| Dashboard | ✅ | Vista principal con resumen operativo |
| Connections | ✅ | Gestión de conexiones |
| Explorer | ✅ | Navegación de schemas, tablas y columnas |
| SQL Runner | ✅ | Ejecución de consultas SQL |
| Structure Editor | ✅ | Creación y modificación de estructura |
| Snippets | ✅ | Consultas guardadas |
| History | ✅ | Registro local de acciones |
| Reports | ✅ | Documentación y exportación |
| Settings | ✅ | Configuración general |

---

## 🧱 Etapas desarrolladas

### ✅ Etapa 1 — Base del proyecto

Objetivo:

    Crear la base real de Electron + React + Vite.

Incluye:

- Monorepo inicial.
- App desktop.
- Configuración Vite.
- Ventana Electron.
- Preload inicial.
- App React montada.

---

### ✅ Etapa 2 — Layout principal

Objetivo:

    Construir la estructura visual principal.

Incluye:

- Sidebar.
- Topbar.
- AppShell.
- Navegación interna.
- Estilos globales.
- Diseño desktop moderno.

---

### ✅ Etapa 3 — Páginas principales

Objetivo:

    Crear todas las vistas base del MVP.

Incluye:

- Dashboard.
- Connections.
- Explorer.
- SQL Runner.
- Structure Editor.
- Snippets.
- History.
- Reports.
- Settings.

---

### ✅ Etapa 4 — Componentes base

Objetivo:

    Crear componentes reutilizables.

Incluye:

- Cards.
- Tablas.
- Modales.
- Botones.
- Estados vacíos.
- Badges.
- Inputs.
- Layout helpers.

---

### ✅ Etapa 5 — Store y estado local

Objetivo:

    Centralizar estado de app, conexiones y explorer.

Incluye:

- app.store.js.
- connection.store.js.
- explorer.store.js.
- Persistencia local.
- Estado seleccionado.
- Estado de navegación.

---

### ✅ Etapa 6 — Bridges de Electron

Objetivo:

    Comunicar React con Electron de forma segura.

Incluye:

- database.bridge.cjs.
- storage.bridge.cjs.
- system.bridge.cjs.
- preload con contextBridge.
- Canales IPC permitidos.
- Validaciones básicas.

---

### ✅ Etapa 7 — Database Core

Objetivo:

    Crear el núcleo desacoplado para trabajar con bases de datos.

Incluye:

- Driver PostgreSQL.
- Driver MySQL.
- Driver SQLite.
- Servicio de conexión.
- Servicio de schemas.
- Servicio de tablas.
- Servicio de queries.

---

### ✅ Etapa 8 — Funciones reales de base de datos

Objetivo:

    Implementar operaciones funcionales del MVP.

Incluye:

- Probar conexión.
- Listar schemas.
- Listar tablas.
- Listar columnas.
- Leer datos.
- Ejecutar SQL.
- Normalizar respuestas entre motores.

---

### ✅ Etapa 9 — Edición de estructura y seguridad

Objetivo:

    Permitir modificar estructura sin convertir la app en una máquina de accidentes.

Incluye:

- Crear tabla.
- Agregar columna.
- Eliminar columna.
- Eliminar tabla.
- Query Guard.
- Confirmaciones destructivas.
- Modo solo lectura.

---

### ✅ Etapa 10 — Historial, snippets, reportes y exportación

Objetivo:

    Cerrar el MVP con herramientas de productividad.

Incluye:

- Historial local.
- Snippets SQL.
- Exportación CSV.
- Exportación JSON.
- Reportes Markdown.
- Documentación técnica de base.

---

## 📤 Exportaciones disponibles

### CSV

Ideal para abrir en Excel, Google Sheets o herramientas de análisis.

    clientes.csv
    productos.csv
    ordenes.csv

---

### JSON

Ideal para integraciones, debugging o respaldo estructurado.

    [
      {
        "id": 1,
        "name": "Cliente Demo",
        "created_at": "2026-05-15"
      }
    ]

---

### Markdown

Ideal para documentación técnica.

    # Database Documentation

    ## Table: clients

    - id: integer
    - name: varchar
    - created_at: timestamp

---

## 🧠 Diferenciales del proyecto

DBPilot Studio no busca competir por cantidad infinita de funciones desde el día uno.

Busca diferenciarse por:

- ⚡ Velocidad de uso.
- 🧼 Interfaz limpia.
- 🧠 Flujo simple.
- 🔐 Seguridad en operaciones destructivas.
- 💻 Trabajo local.
- 🗃️ Soporte para múltiples motores.
- 📚 Documentación rápida de estructura.
- 🛠️ Base escalable para sumar IA, diagramas y edición avanzada.

---

## 🔮 Roadmap futuro

Ideas para próximas versiones:

- ✏️ Edición inline de registros.
- ➕ Insertar registros desde formulario.
- 🗑️ Eliminar registros con confirmación.
- 🔎 Filtros avanzados por columna.
- 🔍 Búsqueda dentro de datos.
- 📄 Paginación real con offset.
- 🧠 Múltiples pestañas SQL.
- 💻 Integración con Monaco Editor.
- 🪄 Autocompletado SQL.
- 🕸️ Diagramas de relaciones.
- 📥 Importar CSV.
- 💾 Backup SQL.
- ♻️ Restore SQL.
- 🔐 Cifrado de contraseñas.
- 📁 Perfiles por proyecto.
- 🤖 IA local con Ollama.
- 🧠 Explicar queries.
- 🚀 Optimizar queries.
- 📈 Sugerir índices.
- ⚠️ Detectar tablas sin primary key.
- 🔁 Comparar dos bases de datos.

---

## 🤖 Futuro módulo IA

La base del proyecto permite sumar una capa de inteligencia artificial local.

Ideas:

    Explicar una query SQL.
    Optimizar una consulta lenta.
    Sugerir índices.
    Detectar columnas mal nombradas.
    Generar documentación automática.
    Crear queries desde lenguaje natural.
    Analizar estructura de una base.
    Detectar tablas sin relaciones.

Ejemplo:

    Usuario:
    "Mostrame los clientes que compraron en los últimos 30 días."

    DBPilot AI:
    SELECT *
    FROM clientes
    WHERE fecha_ultima_compra >= CURRENT_DATE - INTERVAL '30 days';

---

## 🧑‍💻 Perfil ideal de usuario

DBPilot Studio está pensado para:

- Desarrolladores backend.
- Desarrolladores full stack.
- Técnicos IT.
- Administradores de sistemas.
- Analistas de datos.
- Equipos internos de soporte.
- Freelancers que trabajan con bases de clientes.
- Personas que necesitan revisar bases sin abrir herramientas pesadas.

---

## 📦 Estado actual

    Estado: MVP real completo
    Tipo: Desktop App
    Stack: Electron + React + Vite + Node.js
    Bases: PostgreSQL + MySQL/MariaDB + SQLite
    Storage: Local JSON

Incluye:

- ✅ App desktop.
- ✅ UI completa.
- ✅ Conexiones reales.
- ✅ Drivers reales.
- ✅ Bridge Electron.
- ✅ Storage local.
- ✅ Explorer real.
- ✅ SQL Runner real.
- ✅ Editor de estructura.
- ✅ Seguridad.
- ✅ Snippets.
- ✅ History.
- ✅ Reports.
- ✅ Settings.

---

## 📄 Licencia

Este proyecto puede utilizar licencia MIT.

    MIT License

---

## 👨‍💻 Autor

**Matias Isaac Frutos Gonzalez**

    Full Stack Developer
    Técnico Electrónico
    Desarrollo de herramientas desktop, web apps, CRM/ERP, automatización y soluciones internas.

---

## 🧾 Resumen ejecutivo

DBPilot Studio es una aplicación desktop local construida con **Electron**, **React**, **Vite** y **Node.js**.

Permite conectarse a **PostgreSQL** y **MySQL/MariaDB** mediante credenciales de servidor, y abrir bases **SQLite** desde archivos locales.

El MVP permite explorar estructura, ver datos, ejecutar SQL, modificar estructura con seguridad, guardar snippets, registrar historial y exportar documentación.

Es una herramienta real de productividad para desarrolladores y técnicos IT que necesitan trabajar con bases de datos de forma rápida, clara y segura.

---

<div align="center">

## 🧭 DBPilot Studio

### Build databases. Explore structure. Run SQL. Document faster.

<p>
  Proyecto desarrollado por <strong>Matias Isaac Frutos Gonzalez</strong>
</p>

</div>