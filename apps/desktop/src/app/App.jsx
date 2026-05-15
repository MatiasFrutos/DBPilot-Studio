import { useMemo, useState } from "react";

import AppShell from "../layouts/AppShell.jsx";
import { DEFAULT_ROUTE } from "./app.constants.js";
import { getRouteById } from "./app.routes.js";

import "../styles/base.css";
import "../styles/variables.css";
import "../styles/theme.css";

export default function App() {
  const [activeRoute, setActiveRoute] = useState(DEFAULT_ROUTE);

  const currentRoute = useMemo(() => {
    return getRouteById(activeRoute);
  }, [activeRoute]);

  return (
    <AppShell
      activeRoute={activeRoute}
      currentRoute={currentRoute}
      onNavigate={setActiveRoute}
    />
  );
}