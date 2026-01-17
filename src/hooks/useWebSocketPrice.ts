import { useEffect, useState, useRef, useCallback } from 'react';

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  change24h?: number;
}

interface WebSocketMessage {
  type: 'subscribed' | 'unsubscribed' | 'price_update' | 'error';
  symbol?: string;
  message?: string;
  data?: PriceUpdate;
}

interface UseWebSocketPriceReturn {
  price: number | null;
  priceChange: number | null;
  timestamp: number | null;
  isConnected: boolean;
  error: string | null;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';

export function useWebSocketPrice(symbol: string): UseWebSocketPriceReturn {
  const [price, setPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSymbolRef = useRef<string>(symbol);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('[WebSocket] Connecting to', WS_URL);
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      setError(null);
      
      // Subscribe to current symbol
      if (currentSymbolRef.current) {
        const subscribeMsg = JSON.stringify({
          type: 'subscribe_price',
          symbol: currentSymbolRef.current.toLowerCase()
        });
        console.log('[WebSocket] Subscribing:', subscribeMsg);
        ws.send(subscribeMsg);
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'price_update':
            if (message.data) {
              setPrice(message.data.price);
              setTimestamp(message.data.timestamp);
              if (message.data.change24h !== undefined) {
                setPriceChange(message.data.change24h);
              }
            }
            break;
          case 'subscribed':
            console.log('[WebSocket] Subscribed to', message.symbol);
            break;
          case 'unsubscribed':
            console.log('[WebSocket] Unsubscribed from', message.symbol);
            break;
          case 'error':
            console.error('[WebSocket] Error:', message.message);
            setError(message.message || 'Unknown error');
            break;
        }
      } catch (e) {
        console.error('[WebSocket] Failed to parse message:', e);
      }
    };

    ws.onerror = (event) => {
      console.error('[WebSocket] Error:', event);
      setError('WebSocket connection error');
    };

    ws.onclose = (event) => {
      console.log('[WebSocket] Disconnected, code:', event.code);
      setIsConnected(false);
      wsRef.current = null;
      
      // Reconnect after 3 seconds
      if (!event.wasClean) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Reconnecting...');
          connect();
        }, 3000);
      }
    };

    wsRef.current = ws;
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  // Handle symbol change
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      currentSymbolRef.current = symbol;
      return;
    }

    // Unsubscribe from old symbol
    if (currentSymbolRef.current && currentSymbolRef.current !== symbol) {
      ws.send(JSON.stringify({
        type: 'unsubscribe_price',
        symbol: currentSymbolRef.current.toLowerCase()
      }));
    }

    // Subscribe to new symbol
    currentSymbolRef.current = symbol;
    ws.send(JSON.stringify({
      type: 'subscribe_price',
      symbol: symbol.toLowerCase()
    }));

    // Reset price when symbol changes
    setPrice(null);
    setPriceChange(null);
    setTimestamp(null);
  }, [symbol]);

  return {
    price,
    priceChange,
    timestamp,
    isConnected,
    error
  };
}
