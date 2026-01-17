import { Moon, Sun, PanelRightClose, PanelRightOpen, Crown, Brain, LogOut } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { useSymbols } from "@/hooks/useSymbols";
import { useSymbolStore } from "@/store/useSymbolStore";

import { type TradingPair } from "@/types/trading";

interface HeaderProps {
  onPairChange: (pair: TradingPair) => void;
  isVIP: boolean;
  onVIPChange: (value: boolean) => void;
  isPanelOpen: boolean;
  onPanelToggle: () => void;
}

export function Header({
  onPairChange,
  isVIP,
  onVIPChange,
  isPanelOpen,
  onPanelToggle,
}: Omit<HeaderProps, 'selectedPair'>) {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const { selectedSymbol, setSelectedSymbol } = useSymbolStore();
  const { data: symbols = [], isLoading: symbolsLoading } = useSymbols();

  const symbolOptions = symbols.map(symbol => ({
    value: symbol,
    label: symbol
  }));

  return (
    <header className="h-12 border-b border-border bg-card px-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Brain className="h-7 w-7 text-bullish" />
        <span className="text-xl font-bold tracking-tight">
          AI Trade<span className="text-bullish">Vision</span>
        </span>
      </div>

      {/* Center Controls */}
      <div className="flex items-center gap-6">
        {/* Symbol Selector with Search */}
        <Combobox
          options={symbolOptions}
          value={selectedSymbol}
          onValueChange={(value) => {
            setSelectedSymbol(value);
            onPairChange(value as TradingPair);
          }}
          placeholder="Select symbol..."
          searchPlaceholder="Search symbols..."
          emptyMessage="No symbols found."
          className="w-[280px]"
          disabled={symbolsLoading}
        />

        {/* VIP Toggle */}
        <div className="flex items-center gap-2">
          <Crown className={`h-4 w-4 ${isVIP ? "text-yellow-500" : "text-muted-foreground"}`} />
          <Label htmlFor="vip-toggle" className="text-sm text-muted-foreground">
            VIP
          </Label>
          <Switch
            id="vip-toggle"
            checked={isVIP}
            onCheckedChange={onVIPChange}
            className="data-[state=checked]:bg-yellow-500"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground mr-4">
          Welcome, {user?.username}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Panel Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPanelToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          {isPanelOpen ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="text-muted-foreground hover:text-foreground hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
