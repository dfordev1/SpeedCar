import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* HashRouter so the app works on static hosts (GitHub Pages) without
        server-side routing config. */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
