import { cn } from "@/lib/utils";

interface FixieLoaderProps {
  message?: string;
  className?: string;
}

export const FixieLoader = ({
  message = "Memuat...",
  className,
}: FixieLoaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 py-12 text-center text-muted-foreground",
        className,
      )}
    >
      <div className="relative h-28 w-40 sm:w-48">
        <div className="absolute inset-x-8 bottom-1 h-4 rounded-full bg-gradient-to-r from-black/30 via-black/10 to-black/30 opacity-20 blur-md animate-[fixie-shadow_1.8s_ease-in-out_infinite]" />
        <svg
          viewBox="0 0 260 140"
          className="relative h-full w-full text-primary"
          aria-hidden="true"
        >
          <g className="animate-[fixie-bounce_1.8s_ease-in-out_infinite]">
            <circle
              cx="70"
              cy="100"
              r="42"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="animate-[spin_1.2s_linear_infinite]"
              style={{ transformOrigin: "70px 100px" }}
            />
            <circle
              cx="190"
              cy="100"
              r="42"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="animate-[spin_1.2s_linear_infinite]"
              style={{ transformOrigin: "190px 100px" }}
            />

            <circle cx="70" cy="100" r="8" fill="hsl(var(--accent))" />
            <circle cx="190" cy="100" r="8" fill="hsl(var(--accent))" />

            <path
              d="M70 100 L120 40 L190 70 L140 100 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <line
              x1="120"
              y1="40"
              x2="120"
              y2="70"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />

            <rect
              x="110"
              y="26"
              width="32"
              height="8"
              rx="4"
              fill="hsl(var(--foreground))"
            />

            <line
              x1="190"
              y1="70"
              x2="220"
              y2="52"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1="220"
              y1="52"
              x2="232"
              y2="60"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <g
              className="animate-[fixie-pedal_1s_linear_infinite]"
              style={{ transformOrigin: "140px 92px" }}
            >
              <circle cx="140" cy="92" r="12" fill="hsl(var(--accent))" />
              <line
                x1="140"
                y1="92"
                x2="140"
                y2="62"
                stroke="hsl(var(--accent))"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx="140" cy="62" r="6" fill="hsl(var(--accent))" />
            </g>

            <line
              x1="70"
              y1="100"
              x2="140"
              y2="92"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="190"
              y1="100"
              x2="140"
              y2="92"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      <p className="text-base font-medium text-foreground sm:text-lg">{message}</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Mengayuh sepeda fixie Anda untuk pengalaman belanja yang mulus.
      </p>
    </div>
  );
};

export default FixieLoader;
