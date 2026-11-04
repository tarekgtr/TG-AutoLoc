import type { ReactNode } from "react";

/** Titled group of form fields (fieldset with an accessible legend). */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="card p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden="true" className="mb-5 font-bold text-ink-900">
        {title}
      </h2>
      {children}
    </fieldset>
  );
}
