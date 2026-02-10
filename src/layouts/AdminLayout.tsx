import { useAuthStore } from "@/store/useAuthStore"
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom"
import { Shield, Users, LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export const AdminLayout = () => {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user || user.role !== 'admin') {
    return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
    )
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 flex items-center gap-2 font-bold text-xl border-b shrink-0">
            <Shield className="h-6 w-6 text-primary" />
            <span className="truncate">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link to="/admin" className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${location.pathname === '/admin' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
            </Link>
            <Link to="/admin/users" className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${location.pathname === '/admin/users' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
                <Users className="h-4 w-4" />
                Users
            </Link>
        </nav>

        <div className="p-4 border-t mt-auto shrink-0">
            <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="p-8 max-w-7xl mx-auto">
            <Outlet />
        </div>
      </main>
    </div>
  )
}
