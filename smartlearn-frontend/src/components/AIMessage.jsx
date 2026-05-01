import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="code-copy-btn" title="Copy code">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export default function AIMessage({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const codeText = String(children).replace(/\n$/, "");
          return !inline && match ? (
            <div className="code-block-wrapper">
              <div className="code-block-header">
                <span className="code-lang">{match[1]}</span>
                <CopyButton text={codeText} />
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, padding: "1rem", fontSize: "0.875rem", background: "#0d0d0d" }}
                {...props}
              >
                {codeText}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="inline-code" {...props}>{children}</code>
          );
        },
        p: ({ children }) => <p className="md-p">{children}</p>,
        ul: ({ children }) => <ul className="md-ul">{children}</ul>,
        ol: ({ children }) => <ol className="md-ol">{children}</ol>,
        li: ({ children }) => <li className="md-li">{children}</li>,
        h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
        blockquote: ({ children }) => <blockquote className="md-bq">{children}</blockquote>,
        table: ({ children }) => <div className="table-wrap"><table className="md-table">{children}</table></div>,
        a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="md-link">{children}</a>
      }}
    >
      {content}
    </ReactMarkdown>
  );
}