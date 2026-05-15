export const APP_ROUTES = [
  {
    id: "welcome",
    label: "Welcome",
    title: "Inicio",
    description: "Punto de entrada para crear conexiones o abrir SQLite.",
    icon: "⌁",
    enabled: true
  },
  {
    id: "connections",
    label: "Connections",
    title: "Conexiones",
    description: "Administración de conexiones PostgreSQL, MySQL y SQLite.",
    icon: "⛁",
    enabled: true
  },
  {
    id: "explorer",
    label: "Explorer",
    title: "Explorador",
    description: "Vista de schemas, tablas, columnas, índices y relaciones.",
    icon: "▦",
    enabled: true
  },
  {
    id: "table-data",
    label: "Table Data",
    title: "Datos",
    description: "Visualización y edición de registros de una tabla.",
    icon: "▤",
    enabled: true
  },
  {
    id: "table-structure",
    label: "Structure",
    title: "Estructura",
    description: "Editor de columnas, tipos, claves e índices.",
    icon: "▧",
    enabled: true
  },
  {
    id: "sql-runner",
    label: "SQL Runner",
    title: "SQL Runner",
    description: "Editor para ejecutar consultas SQL y revisar resultados.",
    icon: "SQL",
    enabled: true
  },
  {
    id: "snippets",
    label: "Snippets",
    title: "Snippets SQL",
    description: "Biblioteca local de consultas frecuentes.",
    icon: "⌘",
    enabled: true
  },
  {
    id: "history",
    label: "History",
    title: "Historial",
    description: "Registro local de consultas y operaciones sensibles.",
    icon: "◷",
    enabled: true
  },
  {
    id: "reports",
    label: "Reports",
    title: "Reportes",
    description: "Exportación de datos y documentación técnica.",
    icon: "▣",
    enabled: true
  },
  {
    id: "settings",
    label: "Settings",
    title: "Configuración",
    description: "Tema, seguridad, límites y preferencias locales.",
    icon: "⚙",
    enabled: true
  }
];

export function getRouteById(routeId) {
  return APP_ROUTES.find((route) => route.id === routeId) || APP_ROUTES[0];
}

export function getEnabledRoutes() {
  return APP_ROUTES.filter((route) => route.enabled);
}