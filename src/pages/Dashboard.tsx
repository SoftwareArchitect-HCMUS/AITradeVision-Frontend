import { useState } from "react"
import { Header } from "@/components/Header"
import { CandlestickChart } from "@/components/CandlestickChart"
import { RightPanel } from "@/components/RightPanel"
import { type TradingPair, type Timeframe } from "@/types/trading"

const Dashboard = () => {
  const [selectedPair, setSelectedPair] = useState<TradingPair>("BTC/USDT")
  const [isVIP, setIsVIP] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [timeframe, setTimeframe] = useState<Timeframe>("1D")

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        isVIP={isVIP}
        onVIPChange={setIsVIP}
        isPanelOpen={isPanelOpen}
        onPanelToggle={() => setIsPanelOpen(!isPanelOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-card overflow-hidden">
          <CandlestickChart
            pair={selectedPair}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        <RightPanel pair={selectedPair} isVIP={isVIP} isOpen={isPanelOpen} />
      </div>
    </div>
  )
}

export default Dashboard
