import { useState } from "react"
import { Header } from "@/components/Header"
import { CandlestickChart } from "@/components/CandlestickChart"
import { RightPanel } from "@/components/RightPanel"
import { type TradingPair, type Timeframe } from "@/types/trading"
import { useSymbolStore } from "@/store/useSymbolStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useWebSocketPrice } from "@/hooks/useWebSocketPrice"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const Dashboard = () => {
  const { selectedSymbol, setSelectedSymbol } = useSymbolStore()
  const { user } = useAuthStore()
  
  const isVIP = user?.isVip ?? false
  
  const { price } = useWebSocketPrice(selectedSymbol)
  useDocumentTitle(price, selectedSymbol)
  
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [timeframe, setTimeframe] = useState<Timeframe>("1h")

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        onPairChange={(pair) => setSelectedSymbol(pair)}
        isVIP={isVIP}
        isPanelOpen={isPanelOpen}
        onPanelToggle={() => setIsPanelOpen(!isPanelOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-card overflow-hidden">
          <CandlestickChart
            pair={selectedSymbol as TradingPair}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        <RightPanel pair={selectedSymbol as TradingPair} isVIP={isVIP} isOpen={isPanelOpen} />
      </div>
    </div>
  )
}

export default Dashboard
