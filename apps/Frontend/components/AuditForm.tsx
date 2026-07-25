import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { AuditResult } from "../types/types";

interface AuditFormProps {
  onResult: (result: AuditResult, queriedUrl: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const EXAMPLES = [
  "https://en.wikipedia.org/wiki/Web_development",
  "https://news.ycombinator.com",
  "https://example.com",
];

export function AuditForm({ onResult, loading, setLoading }: AuditFormProps) {
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLocalError(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setLocalError("Enter a URL to audit, like https://example.com");
      return;
    }
    setLoading(true);
    // const result = await auditUrl(trimmed);
    setLoading(false);
    // onResult(result, trimmed);
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (localError) setLocalError(null);
            }}
            placeholder="https://example.com"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="URL to audit"
            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Auditing
            </>
          ) : (
            <>
              <Search className="h-5 w-5" aria-hidden="true" />
              Audit
            </>
          )}
        </button>
      </form>

      {localError && (
        <p className="mt-3 flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {localError}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setUrl(example);
              setLocalError(null);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
          >
            {example.replace(/^https?:\/\//, "")}
          </button>
        ))}
      </div>
    </div>
  );
}
