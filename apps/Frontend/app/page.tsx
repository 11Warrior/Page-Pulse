"use client";

import { FormEvent, useState } from "react";

interface AuditReport {
  url: string;
  finalUrl: string;
  status: number;
  responseTimeMs: number;
  contentType: string | null;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imagesTotal: number;
  imagesMissingAlt: number;
  wordCount: number;
}

export default function Page() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setReport(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network Error");
    } finally {
      setLoading(false);
    }
  }

  const altCoverage =
    report && report.imagesTotal > 0
      ? Math.round(
          ((report.imagesTotal - report.imagesMissingAlt) /
            report.imagesTotal) *
            100
        )
      : 100;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Page<span className="text-cyan-400">Pulse</span>
          </h1>

          <p className="mt-4 text-lg text-slate-400">
            Analyze any webpage for SEO & content quality in seconds.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className="mb-10 flex flex-col gap-4 sm:flex-row"
        >
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 outline-none transition focus:border-cyan-400"
          />

          <button
            disabled={loading || !url.trim()}
            className="rounded-xl bg-cyan-500 px-7 py-4 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="font-semibold text-red-400">Error</p>
            <p className="text-sm text-slate-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="text-slate-400">Analyzing website...</p>
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="space-y-8">
            {/* Website */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-3 text-xl font-semibold">
                Website Information
              </h2>

              <a
                href={report.finalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline"
              >
                {report.finalUrl}
              </a>

              <p className="mt-2 text-sm text-slate-400">
                Content Type: {report.contentType}
              </p>
            </div>

            {/* Stats */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Card
                title="HTTP Status"
                value={String(report.status)}
                color={
                  report.status >= 200 && report.status < 300
                    ? "text-green-400"
                    : "text-red-400"
                }
              />

              <Card
                title="Response Time"
                value={`${report.responseTimeMs} ms`}
                color={
                  report.responseTimeMs < 800
                    ? "text-green-400"
                    : report.responseTimeMs < 2500
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              />

              <Card
                title="H1 Count"
                value={String(report.h1Count)}
              />

              <Card
                title="Word Count"
                value={report.wordCount.toLocaleString()}
              />
            </div>

            {/* SEO */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="mb-3 text-lg font-semibold">Page Title</h3>

                <p className="text-slate-300">
                  {report.title || "No title found"}
                </p>

                {report.title && (
                  <p className="mt-2 text-sm text-slate-500">
                    {report.title.length} characters
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="mb-3 text-lg font-semibold">
                  Meta Description
                </h3>

                <p className="text-slate-300">
                  {report.metaDescription || "No meta description found"}
                </p>

                {report.metaDescription && (
                  <p className="mt-2 text-sm text-slate-500">
                    {report.metaDescription.length} characters
                  </p>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Image Alt Coverage
                </h3>

                <span className="text-xl font-bold text-cyan-400">
                  {altCoverage}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{
                    width: `${altCoverage}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex justify-between text-sm text-slate-400">
                <span>Total Images: {report.imagesTotal}</span>

                <span>
                  Missing Alt: {report.imagesMissingAlt}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  color = "",
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <h3 className={`mt-3 text-3xl font-bold ${color}`}>
        {value}
      </h3>
    </div>
  );
}