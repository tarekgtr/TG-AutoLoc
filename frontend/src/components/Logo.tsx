import Image from "next/image";
import { clsx } from "clsx";

/** Official TG AutoLoc logo (public/images/logo.png), displayed unmodified at its square proportions. */
export function Logo({ size = 56, priority = false, className }: { size?: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src="/images/logo.png"
      alt="TG AutoLoc"
      width={size}
      height={size}
      sizes={`${size}px`}
      priority={priority}
      className={clsx("shrink-0 rounded-full", className)}
    />
  );
}
