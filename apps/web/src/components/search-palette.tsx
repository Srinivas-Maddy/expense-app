"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalSearch } from "@/hooks/use-search";
import { formatCurrency, formatDate } from "@/lib/utils";

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const search = useGlobalSearch(query);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  function handleSelect(type: string, id: string) {
    setOpen(false);
    router.push(type === "expense" ? "/expenses" : "/income");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 shadow-sm transition-all hover:border-gray-300 hover:shadow-md w-64"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search transactions...
        <kbd className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">⌘K</kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 animate-in">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search expenses, income, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {search.isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            )}
            <button onClick={() => setOpen(false)} className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500 hover:bg-gray-200">
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.length < 2 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Type at least 2 characters to search
              </div>
            ) : search.data && search.data.length > 0 ? (
              <div className="py-2">
                {search.data.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item.type, item.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      item.type === "expense" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    }`}>
                      {item.type === "expense" ? "E" : "I"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                        {item.category && <span className="text-xs text-gray-400">· {item.category}</span>}
                        {item.source && <span className="text-xs text-gray-400">· {item.source}</span>}
                        {item.tags?.map((t) => (
                          <span key={t.id} className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
                            #{t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${item.type === "expense" ? "text-red-500" : "text-green-600"}`}>
                      {item.type === "expense" ? "-" : "+"}{formatCurrency(item.amount)}
                    </span>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 && !search.isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
