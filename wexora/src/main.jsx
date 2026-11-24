import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AlertProvider } from "./components/Alerts.jsx";
import "./styles/global.css";
import "./styles/effects.css";
import "./styles/nav.css";
import "./styles/admin.css";
import "./styles/alerts.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <AlertProvider>
            <App />
          </AlertProvider>
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);
