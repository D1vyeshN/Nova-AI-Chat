"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button, Tooltip, message } from "antd";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import "highlight.js/styles/github-dark.css";

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
      <div className="rounded-xl overflow-hidden my-3 border border-nova-border bg-[#060810] relative">
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
              className="!h-6 !px-2 !text-[11px] transition-all"
              style={{
                color: copied ? "#10b981" : "#5a6478",
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
            <code className="font-mono text-[13px] leading-relaxed block">
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
      <code className="px-1.5 py-0.5 rounded font-mono text-[13px] text-nova-accent bg-nova-accent/[0.08] border border-nova-accent/[0.15]">
        {children}
      </code>
    );
  },

  // ── Headings ────────────────────────────────────────────────────────────────
  h1: (p) => <h1 className="text-white font-semibold text-xl mt-5 mb-2 leading-snug">{p.children}</h1>,
  h2: (p) => <h2 className="text-white font-semibold text-[17px] mt-5 mb-2 leading-snug">{p.children}</h2>,
  h3: (p) => <h3 className="text-white font-semibold text-[15px] mt-4 mb-1.5 leading-snug">{p.children}</h3>,
  h4: (p) => <h4 className="text-white font-semibold text-[13px] mt-3 mb-1 leading-snug">{p.children}</h4>,

  // ── Paragraph ───────────────────────────────────────────────────────────────
  p: (p) => <p className="mb-3 last:mb-0 text-nova-text leading-relaxed">{p.children}</p>,

  // ── Lists ───────────────────────────────────────────────────────────────────
  ul: (p) => <ul className="pl-5 my-2 mb-3 space-y-1 list-disc marker:text-nova-accent">{p.children}</ul>,
  ol: (p) => <ol className="pl-5 my-2 mb-3 space-y-1 list-decimal marker:text-nova-accent">{p.children}</ol>,
  li: (p) => <li className="text-nova-dim leading-relaxed">{p.children}</li>,

  // ── Blockquote ──────────────────────────────────────────────────────────────
  blockquote: (p) => (
    <blockquote className="border-l-[3px] border-nova-accent pl-3 my-3 py-2 bg-nova-accent/[0.04] rounded-r-md text-nova-dim italic">
      {p.children}
    </blockquote>
  ),

  // ── Table ───────────────────────────────────────────────────────────────────
  table: (p) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-nova-border">
      <table className="w-full text-[13px] border-collapse">{p.children}</table>
    </div>
  ),
  thead: (p) => <thead className="bg-nova-surface">{p.children}</thead>,
  th: (p) => <th className="px-3.5 py-2.5 text-left text-nova-text font-semibold border-b border-nova-border">{p.children}</th>,
  td: (p) => <td className="px-3.5 py-2 text-nova-dim border-b border-nova-border/50 last:border-b-0">{p.children}</td>,
  tr: (p) => <tr className="hover:bg-white/[0.02] transition-colors">{p.children}</tr>,

  // ── HR ──────────────────────────────────────────────────────────────────────
  hr: () => <hr className="border-none border-t border-nova-border my-4" />,

  // ── Links ───────────────────────────────────────────────────────────────────
//   a: (p) => (
    
//       href={p.href}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="text-nova-accent underline underline-offset-2 hover:opacity-80 transition-opacity"
//     >
//       {p.children}
//     </a>
//   ),

  // ── Strong / Em ─────────────────────────────────────────────────────────────
  strong: (p) => <strong className="text-white font-semibold">{p.children}</strong>,
  em:     (p) => <em className="text-nova-dim italic">{p.children}</em>,
};

// ── MarkdownRenderer ───────────────────────────────────────────────────────────
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body text-nova-text text-sm leading-relaxed">
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