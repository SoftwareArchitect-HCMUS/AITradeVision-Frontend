import { Routes, Route, Navigate } from "react-router-dom"
import { AuthGuard } from "@/components/AuthGuard"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import { AdminLayout } from "@/layouts/AdminLayout"
import AdminDashboard from "@/pages/admin/Dashboard"
import UserManagement from "@/pages/admin/UserManagement"
import AdminLogin from "@/pages/AdminLogin"

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
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<UserManagement />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default App
