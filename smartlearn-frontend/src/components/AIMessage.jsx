import React, { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

// 🔹 Copy Button Component
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <button onClick={handleCopy} className="code-copy-btn">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

// 🔹 Main Component
function AIMessage({ content }) {
  if (!content) return null; // safety

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // 🔸 Code Blocks
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const codeText = String(children).replace(/\n$/, "");

          if (!inline && match) {
            return (
              <div className="code-block-wrapper">
                <div className="code-block-header">
                  <span className="code-lang">{match[1]}</span>
                  <CopyButton text={codeText} />
                </div>

                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    fontSize: "0.85rem",
                    borderRadius: "0 0 10px 10px",
                  }}
                  {...props}
                >
                  {codeText}
                </SyntaxHighlighter>
              </div>
            );
          }

          return (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        },

        // 🔸 Text Elements
        p: ({ children }) => <p className="md-p">{children}</p>,
        ul: ({ children }) => <ul className="md-ul">{children}</ul>,
        ol: ({ children }) => <ol className="md-ol">{children}</ol>,
        li: ({ children }) => <li className="md-li">{children}</li>,

        // 🔸 Headings
        h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="md-h3">{children}</h3>,

        // 🔸 Blockquote
        blockquote: ({ children }) => (
          <blockquote className="md-bq">{children}</blockquote>
        ),

        // 🔸 Tables (GFM)
        table: ({ children }) => (
          <div className="table-wrap">
            <table className="md-table">{children}</table>
          </div>
        ),

        // 🔸 Links
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="md-link"
          >
            {children}
          </a>
        ),

        // 🔸 Images (NEW 🔥)
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            className="rounded-lg max-w-full my-3 border border-gray-700"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default memo(AIMessage);