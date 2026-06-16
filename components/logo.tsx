import { cn } from "@/lib/utils";

/**
 * Besedilni logo: "Luka" v navadnem sans-serifu,
 * "Photography" v serif kurzivi z akcentno barvo.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("select-none text-lg leading-none", className)}>
      <span className="font-sans font-medium tracking-wide text-foreground">
        Luka
      </span>{" "}
      <span className="font-serif italic text-accent">Photography</span>
    </span>
  );
}
