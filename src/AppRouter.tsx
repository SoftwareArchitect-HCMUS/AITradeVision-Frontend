import { BrowserRouter } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/ThemeProvider"
import App from "./App"
import { UpgradeVIPModal } from "@/components/UpgradeVIPModal"
import { ProfileModal } from "@/components/ProfileModal"

const queryClient = new QueryClient()

const AppRouter = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <App />
          <UpgradeVIPModal />
          <ProfileModal />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default AppRouter
