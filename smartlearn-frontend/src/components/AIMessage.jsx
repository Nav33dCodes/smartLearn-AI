import React, { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, WrapText } from "lucide-react";

// ── Copy Button ──
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <button onClick={handleCopy} className="code-copy-btn" title="Copy code">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "Copied!" : "Copy"}</span>
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

// ── Code Block ──
function CodeBlock({ language, codeText }) {
  const [wrapped, setWrapped] = useState(false);

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{language}</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <WrapToggle wrapped={wrapped} onToggle={() => setWrapped(w => !w)} />
          <CopyButton text={codeText} />
        </div>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        wrapLines={wrapped}
        wrapLongLines={wrapped}
        customStyle={{
          margin: 0,
          padding: "1.1rem 1rem",
          fontSize: "0.83rem",
          borderRadius: "0 0 14px 14px",
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

// ── Main ──
function AIMessage({ content }) {
  if (!content) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const codeText = String(children).replace(/\n$/, "");

          if (!inline && match) {
            return <CodeBlock language={match[1]} codeText={codeText} />;
          }

          if (!inline && !match) {
            // plain fenced block with no language
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

        p: ({ children }) => <p className="md-p">{children}</p>,
        ul: ({ children }) => <ul className="md-ul">{children}</ul>,
        ol: ({ children }) => <ol className="md-ol">{children}</ol>,
        li: ({ children }) => <li className="md-li">{children}</li>,

        h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="md-h3">{children}</h3>,

        blockquote: ({ children }) => (
          <blockquote className="md-bq">{children}</blockquote>
        ),

        hr: () => <hr className="md-hr" />,

        table: ({ children }) => (
          <div className="table-wrap">
            <table className="md-table">{children}</table>
          </div>
        ),

        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="md-link">
            {children}
          </a>
        ),

        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            style={{
              borderRadius: 10,
              maxWidth: "100%",
              margin: "12px 0",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
            }}
          />
        ),

        strong: ({ children }) => (
          <strong style={{ fontWeight: 600, color: "var(--text-primary)" }}>{children}</strong>
        ),

        em: ({ children }) => (
          <em style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>{children}</em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default memo(AIMessage);