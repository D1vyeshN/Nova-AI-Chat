"use client";

interface Props {
  active: boolean;
  label?: string;
}

export function VoiceVisualizer({ active, label }: Props) {
  if (!active) return null;

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-nova-accent"
            style={{
              animation: "viz 0.6s ease infinite",
              animationDelay: `${i * 0.05}s`,
              minHeight: 4,
            }}
          />
        ))}
      </div>
      {label && (
        <span className="font-mono text-[10px] text-nova-muted uppercase tracking-widest">
          {label}
        </span>
      )}

      <style jsx>{`
        @keyframes viz {
          0%, 100% { height: 4px; opacity: 0.4; }
          50% { height: 28px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
