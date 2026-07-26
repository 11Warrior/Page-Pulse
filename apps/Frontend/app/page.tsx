"use client"
import { useEffect, useState } from "react";
import { Activity, ShieldCheck, GitBranchIcon } from "lucide-react";
import axios from "axios";

function App() {
  const [loading, setLoading] = useState(false);
  const [lastFetchedData, setLastFetchedData] = useState<any>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const query = localStorage.getItem("last-query");

    if (query) {
      try {
        setLastFetchedData(JSON.parse(query));
      } catch {
        localStorage.removeItem("last-query");
      }
    }
  }, []);

  const getReport = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analyze?url=${url}`);

      setLastFetchedData(data);
      localStorage.setItem('last-query', JSON.stringify(data))

    } catch (error) {
      console.error("[ERR] Failed to get the report from frontend");
      throw error;
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">

      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-base font-semibold text-slate-900">Page Pulse</p>
              <p className="text-xs text-slate-500">URL audit tool</p>
            </div>
          </div>
          <a
            href="https://github.com/11Warrior/Page-Pulse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <GitBranchIcon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <section className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
            Fast, read-only page audits
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Audit any web page in seconds
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Enter a URL and Page Pulse will fetch it and report HTTP status, response time, page
            title, meta description, headings, image alt text, and word count.
          </p>
        </section>


        <section className="mx-auto mt-8 max-w-2xl">
          <form onSubmit={getReport} className="mb-8 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              aria-label="URL to audit"
              className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="rounded-md bg-green-400 cursor-pointer px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Auditing…" : "Run audit"}
            </button>
          </form>
        </section>

        {/* Result */}
        <section className="mx-auto mt-10 max-w-4xl">
          {
            lastFetchedData === null ? <EmptyState /> : (
              <pre className="overflow-auto rounded-xl bg-[#1e1e1e] p-6 font-mono text-sm leading-6 text-gray-200 border border-gray-700">
                <code>{JSON.stringify(lastFetchedData, null, 2)}</code>
              </pre>
            )

          }
        </section>

      </main>

      <footer className="border-t border-slate-200 bg-white w-full h-full">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-slate-700 sm:px-6 flex gap-5 justify-center">
          <div>
            Page Pulse &middot; A read-only URL auditing tool. <br />
            <strong className="font-">"Built for Digital Heroes
              Training Task",</strong>
          </div>
          <a href="https://digitalheroesco.com">
            <img className="h-10 w-20" src="https://internshala-uploads.internshala.com/logo%2F61ede14cab2361642979660.png.webp" alt="" />
          </a>
        </div>
      </footer>

    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Activity className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="mt-4 text-base font-medium text-slate-700">No audit yet</p>
      <p className="mt-1 text-sm text-slate-500">
        Enter a URL above and hit Audit to see a full report here.
      </p>
    </div>
  );
}

// function LoadingState() {
//   return (
//     <div className="space-y-4">
//       <div className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
//         ))}
//       </div>
//       <p className="text-center text-sm text-slate-500">Fetching and analyzing the page…</p>
//     </div>
//   );
// }

export default App;
