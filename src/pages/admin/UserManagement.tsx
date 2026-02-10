import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import api from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ban, ShieldCheck, Crown, CircleOff, MoreHorizontal } from "lucide-react"

interface User {
  id: number
  email: string
  username: string
  role: string
  isActive: boolean
  isVip: boolean
  createdAt: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data)
    } catch {
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleBan = async (userId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`)
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u))
      toast.success(`User ${!currentStatus ? 'activated' : 'banned'} successfully`)
    } catch {
      toast.error('Failed to update user status')
    }
  }

  const handleToggleVip = async (userId: number, currentVip: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/vip`)
      setUsers(users.map(u => u.id === userId ? { ...u, isVip: !currentVip } : u))
      toast.success(`User VIP ${!currentVip ? 'granted' : 'revoked'} successfully`)
    } catch {
      toast.error('Failed to update VIP status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">View and manage user accounts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                    <tr>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Username</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">VIP</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle font-medium">{user.id}</td>
                            <td className="p-4 align-middle">{user.username}</td>
                            <td className="p-4 align-middle">{user.email}</td>
                            <td className="p-4 align-middle">
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </td>
                            <td className="p-4 align-middle">
                                <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                                    {user.isActive ? 'Active' : 'Banned'}
                                </Badge>
                            </td>
                            <td className="p-4 align-middle">
                                {user.isVip ? <Badge className="bg-yellow-500 hover:bg-yellow-600">VIP</Badge> : '-'}
                            </td>
                            <td className="p-4 align-middle text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 align-middle text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleToggleVip(user.id, user.isVip)}>
                                            {user.isVip ? (
                                                <><CircleOff className="mr-2 h-4 w-4" /> Revoke VIP</>
                                            ) : (
                                                <><Crown className="mr-2 h-4 w-4" /> Grant VIP</>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleToggleBan(user.id, user.isActive)}
                                            className={user.isActive ? "text-destructive" : "text-green-600"}
                                        >
                                            {user.isActive ? (
                                                <><Ban className="mr-2 h-4 w-4" /> Ban User</>
                                            ) : (
                                                <><ShieldCheck className="mr-2 h-4 w-4" /> Activate User</>
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
