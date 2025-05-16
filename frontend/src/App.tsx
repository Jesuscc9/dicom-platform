// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/uploadPage";
import ListPage from "./pages/ListPage";
import { NotificationProvider } from "./context/NotificationContext";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studies"
                element={
                  <ProtectedRoute>
                    <ListPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
