import Link from "next/link";
import type { Metadata } from "next";
import { BackgroundRemover } from "@/components/background-remover";

export const metadata: Metadata = {
  title: "Background removal unavailable - Aritfy",
  description: "Background removal is deferred in this release. The design editor, templates and saved versions remain available.",
};

export default function RemoveBackgroundPage() {
  return (
    <main className="container mx-auto py-8 px-4 space-y-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Background removal</h1>
        <p className="text-muted-foreground">This feature is deferred, not a working feature of the current release.</p>
      </div>
      <BackgroundRemover />
      <div className="mx-auto max-w-3xl"><Link className="underline text-sm" href="/">Return to the dashboard</Link></div>
    </main>
  );
}
