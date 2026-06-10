import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Network, Maximize2, Download } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#10b981', // Emerald
    primaryTextColor: '#fff',
    primaryBorderColor: '#059669',
    lineColor: '#6b7280',
    secondaryColor: '#f3f4f6',
    tertiaryColor: '#fff',
  },
  securityLevel: 'loose',
});

export default function MermaidBlock({ data }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, data);
        if (isMounted) {
          setSvgContent(svg);
          setError(false);
        }
      } catch (err) {
        console.error("Mermaid parsing error:", err);
        if (isMounted) setError(true);
      }
    };

    renderChart();
    
    return () => { isMounted = false; };
  }, [data]);

  const handleDownload = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindmap.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="text-destructive p-4 border border-destructive/20 bg-destructive/10 rounded-xl my-4 text-sm font-mono">
        Syntax error in Mermaid diagram generation.
      </div>
    );
  }

  return (
    <div className="my-6 border border-border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={18} className="text-primary" />
          <span className="font-semibold text-sm tracking-tight">Mind Map</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded transition-colors" title="Download SVG">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 md:p-6 bg-white dark:bg-[#0d0d0d] overflow-auto flex items-center justify-center min-h-[300px]">
        {svgContent ? (
          <div 
            className="mermaid-container w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svgContent }} 
          />
        ) : (
          <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
            <Network className="animate-spin" size={16} /> Rendering map...
          </div>
        )}
      </div>
    </div>
  );
}
