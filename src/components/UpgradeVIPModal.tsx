import { useState } from "react";
import { Crown, Check, CreditCard, Sparkles, Zap, Brain, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useVIPModalStore } from "@/store/useVIPModalStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VIP_FEATURES = [
  { icon: Brain, text: "AI-Powered Market Analysis" },
  { icon: TrendingUp, text: "Real-time Predictions (UP/DOWN)" },
  { icon: Zap, text: "Sentiment Analysis on News" },
  { icon: Shield, text: "Confidence Scores & Reasoning" },
];

export function UpgradeVIPModal() {
  const { isOpen, closeModal } = useVIPModalStore();
  const { upgradeToVIP } = useAuth();
  const [step, setStep] = useState<"plan" | "payment" | "success">("plan");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = () => {
    setStep("payment");
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Call upgrade API
    upgradeToVIP.mutate(undefined, {
      onSuccess: () => {
        setStep("success");
        setIsProcessing(false);
        // Auto close after 2.5 seconds
        setTimeout(() => {
          closeModal();
          // Reset after modal animation
          setTimeout(resetModal, 300);
        }, 2500);
      },
      onError: () => {
        setIsProcessing(false);
      }
    });
  };

  const resetModal = () => {
    setStep("plan");
    setCardNumber("");
    setExpiry("");
    setCvv("");
  };

  const handleClose = () => {
    closeModal();
    setTimeout(resetModal, 300);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, "").replace(/\D/g, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches?.[0] || "";
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-gradient-to-b from-card to-background">
        {step === "plan" && (
          <>
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 p-6 border-b border-yellow-500/20">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500">
                    <Crown className="h-5 w-5 text-black" />
                  </div>
                  <DialogTitle className="text-2xl font-bold">
                    Upgrade to <span className="text-yellow-500">VIP</span>
                  </DialogTitle>
                </div>
                <DialogDescription className="text-muted-foreground">
                  Unlock the full power of AI-driven trading insights
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6">
              {/* Price Card */}
              <div className="relative rounded-xl border-2 border-yellow-500/50 bg-gradient-to-b from-yellow-500/5 to-transparent p-6 mb-6">
                <div className="absolute -top-3 left-4">
                  <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-yellow-500">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="space-y-3">
                  {VIP_FEATURES.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-yellow-500/20">
                        <Check className="h-3 w-3 text-yellow-500" />
                      </div>
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={handleSelectPlan}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold hover:from-yellow-600 hover:to-amber-600 gap-2"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                Continue to Payment
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Cancel anytime • 30-day money back guarantee
              </p>
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 border-b border-blue-500/20">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <DialogTitle className="text-xl font-bold">
                    Payment Details
                  </DialogTitle>
                </div>
                <DialogDescription className="text-muted-foreground">
                  Complete your VIP subscription
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card-number" className="text-sm font-medium">
                    Card Number
                  </Label>
                  <Input
                    id="card-number"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="mt-1.5 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry" className="text-sm font-medium">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      className="mt-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-sm font-medium">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      maxLength={3}
                      className="mt-1.5 font-mono"
                      type="password"
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-secondary/30 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">VIP Subscription</span>
                    <span className="font-medium">$29.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-lg text-yellow-500">$29.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing || cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 font-bold hover:from-blue-600 hover:to-purple-600 gap-2"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Pay $29.00
                  </>
                )}
              </Button>

              <button
                onClick={() => setStep("plan")}
                className="w-full text-sm text-muted-foreground hover:text-foreground mt-3"
              >
                ← Back to plan
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="p-8 text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full animate-ping opacity-25" />
              <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full">
                <Crown className="h-10 w-10 text-black" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">
              Welcome to <span className="text-yellow-500">VIP</span>! 🎉
            </h2>
            <p className="text-muted-foreground mb-4">
              You now have access to all AI-powered features
            </p>
            
            <div className="flex flex-wrap justify-center gap-2">
              {VIP_FEATURES.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium"
                >
                  <feature.icon className="h-3 w-3" />
                  {feature.text}
                </span>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
