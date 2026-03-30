"use client";

import { useState, useMemo } from "react";
import data from "../public/data.json";

type Video = {
  url: string;
  title: string;
  memo: string;
  date: string;
  author: string;
  tags: string[];
};

function getYouTubeId(url: string): string | null {
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/embed\/([^?&]+)/);
  return m ? m[1] : null;
}

export default function Home() {
  const videos: Video[] = data as Video[];
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => v.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [videos]);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.memo.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q));
      const matchTag = !activeTag || v.tags.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [videos, search, activeTag]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            📺 伊藤YouTube講座 リンク集
          </h1>
          <input
            type="text"
            placeholder="キーワードで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeTag === null
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              すべて
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeTag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} 件 / 全 {videos.length} 件
        </p>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v, i) => {
            const ytId = getYouTubeId(v.url);
            const thumb = ytId
              ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
              : null;
            return (
              <a
                key={i}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
              >
                {thumb && (
                  <div className="relative aspect-video bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {v.title || "（タイトルなし）"}
                  </h2>
                  {v.memo && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {v.memo}
                    </p>
                  )}
                  {v.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-2">
                      {v.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400">{v.date}</p>
                </div>
              </a>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            該当する動画が見つかりませんでした
          </div>
        )}
      </main>
    </div>
  );
}
