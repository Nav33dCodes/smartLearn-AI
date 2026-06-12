import React, { useState, memo, useEffect, useRef, lazy, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, WrapText, Volume2, Square, Download, Loader2 } from "lucide-react";
import QuizBlock from "./QuizBlock";
import FlashcardBlock from "./FlashcardBlock";
import MermaidBlock from "./MermaidBlock";
import MindMapBlock from "./MindMapBlock";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const ChartBlock = lazy(() => import("./ChartBlock"));

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

// ── Copy Button ──
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <button onClick={handleCopy} className="code-copy-btn flex items-center gap-1.5 p-1.5 rounded-md hover:bg-muted/50 transition-colors text-xs text-muted-foreground hover:text-foreground" title="Copy code">
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      <span className={copied ? "text-emerald-500" : ""}>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

// ── Word Wrap Toggle ──
function WrapToggle({ wrapped, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="code-copy-btn"
      title={wrapped ? "Disable word wrap" : "Enable word wrap"}
      style={{ marginRight: 4 }}
    >
      <WrapText size={13} />
      <span>{wrapped ? "Unwrap" : "Wrap"}</span>
    </button>
  );
}

function DownloadButton({ text, language }) {
  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Attempt to map common languages to extensions
    const extMap = {
      javascript: "js", typescript: "ts", python: "py", html: "html", css: "css",
      json: "json", bash: "sh", shell: "sh", markdown: "md", sql: "sql",
      java: "java", cpp: "cpp", c: "c", csharp: "cs", go: "go", rust: "rs"
    };
    const ext = extMap[language.toLowerCase()] || "txt";
    
    a.download = `code_snippet.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleDownload} className="code-copy-btn" title="Download code">
      <Download size={13} />
      <span>Download</span>
    </button>
  );
}

// ── Code Block ──
function CodeBlock({ language, codeText }) {
  const [wrapped, setWrapped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="code-block-wrapper border border-border overflow-hidden rounded-xl shadow-sm my-6 group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="code-block-header bg-muted/20 px-4 py-2.5 border-b border-border flex items-center justify-between">
        <span className="code-lang text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-1 rounded-md">{language || "text"}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <WrapToggle wrapped={wrapped} onToggle={() => setWrapped(w => !w)} />
          <DownloadButton text={codeText} language={language} />
          <CopyButton text={codeText} />
        </div>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        showLineNumbers={isHovered}
        wrapLines={wrapped}
        wrapLongLines={wrapped}
        customStyle={{
          margin: 0,
          padding: "1.25rem 1.25rem",
          fontSize: "0.85rem",
          borderRadius: "0",
          backgroundColor: "#0d0d0d", // Darker background
          lineHeight: 1.65,
          overflowX: wrapped ? "hidden" : "auto",
        }}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Inline Copy Button for plain code ──
function InlineCopyCode({ children }) {
  const [copied, setCopied] = useState(false);
  const text = String(children);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <code
      className="inline-code"
      onClick={handleCopy}
      title="Click to copy"
      style={{ cursor: "pointer", userSelect: "all", transition: "opacity 0.15s", opacity: copied ? 0.6 : 1 }}
    >
      {copied ? "✓ copied" : children}
    </code>
  );
}

// ── Static Renderers Map ──
const markdownRenderers = {
  code({ inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeText = String(children).replace(/\n$/, "");

    if (!inline && match) {
      const lang = match[1].toLowerCase();
      if (lang === "quiz") {
        return <QuizBlock data={codeText} />;
      }
      if (lang === "flashcard" || lang === "flashcards") {
        return <FlashcardBlock data={codeText} />;
      }
      if (lang === "mermaid") {
        return <MermaidBlock data={codeText} />;
      }
      if (lang === "mindmap") {
        return <MindMapBlock data={codeText} />;
      }
      if (lang === "chart") {
        return (
          <Suspense fallback={
            <div className="bg-[#0f0f0f] border border-border/50 rounded-2xl h-[300px] my-6 flex flex-col items-center justify-center gap-4 text-muted-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="font-semibold text-sm tracking-widest uppercase">Loading Chart Engine...</span>
              </div>
            </div>
          }>
            <ChartBlock data={codeText} />
          </Suspense>
        );
      }
      return <CodeBlock language={match[1]} codeText={codeText} />;
    }

    if (!inline && !match) {
      return (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <span className="code-lang">code</span>
            <CopyButton text={codeText} />
          </div>
          <pre style={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.83rem",
            overflowX: "auto",
            background: "#0d0d0d",
            color: "#d4d4d4",
            lineHeight: 1.65,
            borderRadius: "0 0 14px 14px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <code {...props}>{codeText}</code>
          </pre>
        </div>
      );
    }

    return <InlineCopyCode {...props}>{children}</InlineCopyCode>;
  },
  p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-5 text-foreground">{children}</p>,
  ul: ({ children }) => <ul className="my-5 ml-6 list-disc marker:text-muted-foreground [&>li]:mt-2">{children}</ul>,
  ol: ({ children }) => <ol className="my-5 ml-6 list-decimal marker:text-muted-foreground [&>li]:mt-2">{children}</ol>,
  li: ({ children }) => <li className="text-foreground">{children}</li>,
  h1: ({ children }) => <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mt-8 mb-4">{children}</h1>,
  h2: ({ children }) => <h2 className="scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight transition-colors mt-8 mb-4">{children}</h2>,
  h3: ({ children }) => <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-3">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground bg-muted/30 py-1 pr-4 rounded-r-lg">{children}</blockquote>
  ),
  hr: () => <hr className="my-8 border-border" />,
  table: ({ children }) => (
    <div className="my-6 w-full max-w-[100%] overflow-x-auto rounded-lg border border-border shadow-sm bg-card">
      <table className="w-full text-left text-[15px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted text-muted-foreground border-b border-border">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }) => <tr className="transition-colors hover:bg-muted/30">{children}</tr>,
  th: ({ children }) => <th className="px-4 py-3 font-semibold text-foreground border-r border-border last:border-r-0 whitespace-nowrap">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3 align-top leading-relaxed border-r border-border last:border-r-0 break-words min-w-[120px]">{children}</td>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img src={src} alt={alt} className="rounded-lg border border-border shadow-sm max-w-full my-4" />
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
};

// ── Main ──
function AIMessage({ content }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFetchingTTS, setIsFetchingTTS] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleSpeech = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsFetchingTTS(true);
    try {
      const plainText = content.replace(/[*#_`~]/g, '');
      const res = await fetch(`${API}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: plainText, voice: "en-US-JennyNeural" })
      });
      if (!res.ok) throw new Error("TTS failed");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Neural TTS failed, falling back to browser:", err);
      const plainText = content.replace(/[*#_`~]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Natural"));
      if (premiumVoice) utterance.voice = premiumVoice;

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } finally {
      setIsFetchingTTS(false);
    }
  };

  if (!content) return null;

  return (
    <div className="group relative">
      <div className="markdown-body">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]} 
          rehypePlugins={[rehypeKatex]}
          components={markdownRenderers}
        >
          {content}
        </ReactMarkdown>
      </div>
      
      <div className="mt-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={toggleSpeech}
          disabled={isFetchingTTS}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium transition-colors p-1 -ml-1 rounded hover:bg-muted disabled:opacity-50"
        >
          {isFetchingTTS ? <Loader2 size={14} className="animate-spin text-primary" /> : isPlaying ? <Square size={14} className="fill-current text-primary" /> : <Volume2 size={14} />}
          {isFetchingTTS ? "Loading voice..." : isPlaying ? "Stop playing" : "Read aloud"}
        </button>
      </div>
    </div>
  );
}

export default memo(AIMessage);