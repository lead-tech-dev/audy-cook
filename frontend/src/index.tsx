// AUDY COOK - Frontend entry
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "@/App";
import "@/styles/global.scss";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
const Router = process.env.REACT_APP_ROUTER_MODE === "hash" ? HashRouter : BrowserRouter;

root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
