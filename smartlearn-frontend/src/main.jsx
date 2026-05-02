import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

// 🔐 Check auth
const isAuthenticated = () => !!localStorage.getItem("token");

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

      {/* 🔐 PROTECTED */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />

      {/* 🔓 PUBLIC */}
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/" /> : <Login />}
      />

      <Route
        path="/signup"
        element={isAuthenticated() ? <Navigate to="/" /> : <Signup />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* 🔁 FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  </BrowserRouter>
);