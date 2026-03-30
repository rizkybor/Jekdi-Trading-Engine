import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries } from 'lightweight-charts';

interface ChartProps {
  data: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  symbol: string;
}

export function PriceChart({ data, symbol }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Map data to lightweight-charts format
    const chartData = data.map(item => {
      // Lightweight charts requires time as string 'YYYY-MM-DD' for daily charts
      const date = new Date(item.timestamp);
      const timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      return {
        time: timeStr,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      };
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#737373', // neutral-500
      },
      grid: {
        vertLines: { color: '#262626' }, // neutral-800
        horzLines: { color: '#262626' },
      },
      rightPriceScale: {
        borderColor: '#262626',
      },
      timeScale: {
        borderColor: '#262626',
        timeVisible: true,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        vertLine: {
          color: '#525252',
          labelBackgroundColor: '#171717',
        },
        horzLine: {
          color: '#525252',
          labelBackgroundColor: '#171717',
        },
      },
      height: 350,
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', // emerald-500
      downColor: '#f43f5e', // rose-500
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    candlestickSeries.setData(chartData);
    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-md p-4 relative">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-white font-bold text-lg uppercase tracking-tight">{symbol} <span className="text-neutral-500 text-sm font-medium tracking-widest">IDX</span></h3>
      </div>
      <div ref={chartContainerRef} className="w-full h-[350px]" />
    </div>
  );
}