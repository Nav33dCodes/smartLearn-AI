import React, { useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { BarChart as BarChartIcon, Loader2 } from 'lucide-react';

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ChartBlock({ data }) {
  const parsed = useMemo(() => {
    try {
      let cleanData = data;
      if (typeof cleanData === 'string') {
        cleanData = cleanData.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const jsonMatch = cleanData.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanData = jsonMatch[0];
        }

        cleanData = cleanData.replace(/,\s*([\]}])/g, '$1'); // Remove trailing commas
        return JSON.parse(cleanData);
      }
      return cleanData;
    } catch (err) {
      return null;
    }
  }, [data]);

  if (!parsed || !parsed.data) {
    return (
      <div className="bg-[#0f0f0f] border border-border/50 rounded-2xl overflow-hidden shadow-lg h-[300px] w-full my-6 flex flex-col items-center justify-center gap-4 text-muted-foreground relative">
        <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
        <BarChartIcon size={32} className="text-primary/50 animate-bounce" />
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="font-semibold text-sm tracking-widest uppercase">Rendering Chart...</span>
        </div>
      </div>
    );
  }

  const { type = 'bar', data: rawData, xKey = 'name', yKeys: rawYKeys = ['value'], colors: rawColors = DEFAULT_COLORS } = parsed;

  const chartData = Array.isArray(rawData) ? rawData : [];
  const yKeys = Array.isArray(rawYKeys) ? rawYKeys : [rawYKeys].filter(Boolean);
  const colors = Array.isArray(rawColors) ? rawColors : [rawColors].filter(Boolean);
  
  // Provide fallback colors if empty
  const safeColors = colors.length > 0 ? colors : DEFAULT_COLORS;

  const renderChart = () => {
    const chartType = String(type).toLowerCase();
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey={xKey} stroke="#888" tick={{ fill: '#888' }} />
            <YAxis stroke="#888" tick={{ fill: '#888' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }} />
            <Legend />
            {yKeys.map((key, index) => (
              <Line key={key} type="monotone" dataKey={key} stroke={safeColors[index % safeColors.length]} strokeWidth={2} activeDot={{ r: 8 }} />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey={xKey} stroke="#888" tick={{ fill: '#888' }} />
            <YAxis stroke="#888" tick={{ fill: '#888' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }} />
            <Legend />
            {yKeys.map((key, index) => (
              <Area key={key} type="monotone" dataKey={key} stroke={safeColors[index % safeColors.length]} fill={safeColors[index % safeColors.length]} fillOpacity={0.3} />
            ))}
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }} />
            <Legend />
            {yKeys.map((key, index) => (
              <Pie key={key} data={chartData} dataKey={key} nameKey={xKey} cx="50%" cy="50%" outerRadius={100} label>
                {chartData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={safeColors[i % safeColors.length]} />
                ))}
              </Pie>
            ))}
          </PieChart>
        );
      case 'bar':
      default:
        return (
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey={xKey} stroke="#888" tick={{ fill: '#888' }} />
            <YAxis stroke="#888" tick={{ fill: '#888' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff' }} cursor={{ fill: '#222' }} />
            <Legend />
            {yKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={safeColors[index % safeColors.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="bg-card border border-border overflow-hidden rounded-xl shadow-sm my-6 p-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
