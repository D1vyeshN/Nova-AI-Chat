"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button, Tooltip, message } from "antd";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import "highlight.js/styles/github-dark.css";
import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  content: string;
}

// ── Extract plain text recursively from React children ────────────────────────
// This is the key fix — rehype-highlight wraps tokens in <span> elements
// so children is never a plain string, it's a tree of React nodes
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in (children as any)) {
    return extractText((children as any).props?.children);
  }
  return "";
}

// ── CodeBlock ──────────────────────────────────────────────────────────────────
function CodeBlock({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleCopy = async () => {
    try {
      // extract plain text for clipboard — not the highlighted JSX
      const plain = extractText(children);
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      messageApi.success({ content: "Copied!", duration: 1.5 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      messageApi.error({ content: "Copy failed", duration: 2 });
    }
  };

  return (
    <>
      {contextHolder}
      <div className="rounded-xl overflow-hidden my-3 border border-nova-border bg-nova-surface2 relative">
        {/* Header */}
        <div className="absolute top-2 right-2">
          {/* <span className="font-mono text-[10px] uppercase tracking-widest text-nova-muted">
            {lang || "text"}
          </span> */}
          <Tooltip title={copied ? "Copied!" : "Copy code"} placement="left">
            <Button
              type="text"
              size="small"
              icon={copied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleCopy}
              className="!h-6 !px-2 component-status transition-all"
              style={{
                color: copied ? "var(--nova-accent3)" : "var(--nova-muted)",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              {/* {copied ? "Copied" : "Copy"} */}
            </Button>
          </Tooltip>
        </div>

        {/* ✅ Render children directly — preserves hljs <span> highlighting */}
        <div className="overflow-x-auto">
          <pre className="p-3.5 m-0 bg-transparent">
            <code className="font-mono markdown-code leading-relaxed block">
              {children}
            </code>
          </pre>
        </div>
      </div>
    </>
  );
}

// ── Components ─────────────────────────────────────────────────────────────────
const components: Components = {

  // ✅ pre — intercepts ALL fenced blocks
  // rehype-highlight puts language class on <code> inside <pre>
  pre(props) {
    const { children } = props;

    // find the inner <code> element
    const codeEl = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;

    const className = codeEl?.props?.className ?? "";
    const lang = className.replace("language-", "").trim();

    // ✅ pass the raw children (hljs spans) directly — don't stringify
    return <CodeBlock lang={lang}>{codeEl?.props?.children}</CodeBlock>;
  },

  // ✅ code — ONLY handles inline code
  // block code is already caught by pre above
  code(props) {
    const { className, children } = props;

    // block code leaking through — shouldn't happen but guard it
    if (className?.startsWith("language-")) {
      return <code className={className}>{children}</code>;
    }

    return (
      <code className="px-1.5 py-0.5 rounded font-mono markdown-code text-nova-text bg-nova-border">
        {children}
      </code>
    );
  },

  // ── Headings ────────────────────────────────────────────────────────────────
  h1: (p) => <h1 className="text-nova-text font-semibold markdown-h1 mt-5 mb-2 leading-snug">{p.children}</h1>,
  h2: (p) => <h2 className="text-nova-text font-semibold markdown-h2 mt-5 mb-2 leading-snug">{p.children}</h2>,
  h3: (p) => <h3 className="text-nova-text font-semibold markdown-h3 mt-4 mb-1.5 leading-snug">{p.children}</h3>,
  h4: (p) => <h4 className="text-nova-text font-semibold markdown-h4 mt-3 mb-1 leading-snug">{p.children}</h4>,

  // ── Paragraph ───────────────────────────────────────────────────────────────
  p: (p) => <p className="mb-3 px-1 last:mb-0 text-nova-text leading-relaxed markdown-body">{p.children}</p>,

  // ── Lists ───────────────────────────────────────────────────────────────────
  ul: (p) => <ul className="pl-10 pr-1 my-2 mb-3 space-y-1 list-disc marker:text-nova-text marker:font-semibold">{p.children}</ul>,
  ol: (p) => <ol className="pl-10 pr-1 my-2 mb-3 space-y-1 list-decimal marker:text-nova-text marker:font-semibold">{p.children}</ol>,
  li: (p) => <li className="text-nova-text wrap-break-word leading-relaxed markdown-body">{p.children}</li>,

  // ── Blockquote ──────────────────────────────────────────────────────────────
  blockquote: (p) => (
    <blockquote className="border-l-[3px] border-nova-accent pl-3 my-3 py-2 bg-nova-accent/[0.04] rounded-r-md text-nova-dim italic">
      {p.children}
    </blockquote>
  ),

  // ── Table ───────────────────────────────────────────────────────────────────
  table: (p) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-nova-border">
      <table className="w-full markdown-body border-collapse">{p.children}</table>
    </div>
  ),
  thead: (p) => <thead className="bg-nova-surface">{p.children}</thead>,
  th: (p) => <th className="px-3.5 py-2.5 text-left text-nova-text font-semibold border-b border-nova-border">{p.children}</th>,
  td: (p) => <td className="px-3.5 py-2 text-nova-dim markdown-body border-b border-nova-border/50 last:border-b-0">{p.children}</td>,
  tr: (p) => <tr className="hover:bg-nova-surface/50 transition-colors">{p.children}</tr>,

  // ── HR ──────────────────────────────────────────────────────────────────────
  hr: () => <hr className="border-none border-t border-nova-border my-4" />,

  // ── Links ───────────────────────────────────────────────────────────────────
//   a: (p) => (
    
//       href={p.href}
//       target="_blank"
//       rel="noopener noreferrer"

  // ── Strong / Em ─────────────────────────────────────────────────────────────
  strong: (p) => <strong className="text-nova-text font-semibold">{p.children}</strong>,
  em:     (p) => <em className="text-nova-dim italic">{p.children}</em>,
};

// ── MarkdownRenderer ───────────────────────────────────────────────────────────
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className={`markdown-body w-full text-nova-text leading-relaxed hljs-${resolvedTheme}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}