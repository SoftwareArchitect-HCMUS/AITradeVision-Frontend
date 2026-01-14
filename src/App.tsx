import { Routes, Route, Navigate } from "react-router-dom"
import { AuthGuard } from "@/components/AuthGuard"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/"
      element={
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default App
