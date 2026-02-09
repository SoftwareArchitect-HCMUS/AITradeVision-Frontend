import { useEffect } from 'react';

const SITE_NAME = 'AI Trade Vision';

export function useDocumentTitle(
  price: number | null,
  symbol: string
): void {
  useEffect(() => {
    if (price !== null) {
      const formattedPrice = price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: price < 1 ? 6 : 2,
      });
      
      document.title = `$${formattedPrice} | ${symbol.toUpperCase()} | ${SITE_NAME}`;
    } else {
      document.title = `${symbol.toUpperCase()} | ${SITE_NAME}`;
    }

    return () => {
      document.title = SITE_NAME;
    };
  }, [price, symbol]);
}
