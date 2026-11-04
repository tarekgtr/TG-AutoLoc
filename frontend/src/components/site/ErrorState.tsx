import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

export function ErrorState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div role="alert" className="card mx-auto flex max-w-xl flex-col items-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-ink-900">{title}</h2>
      <p className="mt-2 text-sm text-ink-600">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
