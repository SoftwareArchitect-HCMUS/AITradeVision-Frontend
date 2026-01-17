import { useEffect, useState } from 'react';
import { type IChartApi } from 'lightweight-charts';

export function useChartResize(
  containerRef: React.RefObject<HTMLDivElement | null>,
  chartRef: React.MutableRefObject<IChartApi | null>
) {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { height, width } = entry.contentRect;
        setHeight(height);
        
        if (chartRef.current) {
          chartRef.current.applyOptions({ 
            width, 
            height 
          });
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [containerRef, chartRef]);

  return { height };
}
