"use client";

import { RobotOutlined } from "@ant-design/icons";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      {/* <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border border-nova-border"
        style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15))" }}
      >
        <RobotOutlined style={{ color: "#00e5ff", fontSize: 14 }} />
      </div> */}

      <div className="flex flex-col gap-1">
        {/* <div className="font-mono text-[10px] text-nova-muted">NOVA</div> */}
        <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-nova-surface border border-nova-border">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-nova-accent"
                style={{
                  animation: `typing 1.2s ease infinite`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
