import { notFound } from "next/navigation";

/** Renders the localized 404 page for any unknown path under a locale. */
export default function CatchAll() {
  notFound();
}
