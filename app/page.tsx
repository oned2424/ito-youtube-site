"use client";

import { useState, useMemo } from "react";
import data from "../public/data.json";

type Material = { label: string; url: string };

type Video = {
  url: string;
  title: string;
  memo: string;
  date: string;
  author: string;
  tags: string[];
  full_text: string;
  materials: Material[];
};

function getYouTubeId(url: string): string | null {
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/embed\/([^?&]+)/);
  return m ? m[1] : null;
}

function materialIcon(url: string): string {
  if (url.includes("notion")) return "📝";
  if (url.includes("docs.google.com")) return "📄";
  if (url.includes("slides.google.com")) return "📊";
  if (url.includes("gigafile")) return "🔊";
  if (url.includes("amzn") || url.includes("amazon")) return "📚";
  if (url.includes("youtube") || url.includes("youtu.be")) return "▶️";
  if (url.includes("loom")) return "🎬";
  return "🔗";
}

function Modal({ video, onClose }: { video: Video; onClose: () => void }) {
  const ytId = getYouTubeId(video.url);
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {ytId && (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full h-full rounded-t-2xl"
              allowFullScreen
            />
          </div>
        )}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900 leading-snug">
              {video.title || "（タイトルなし）"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>

          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400">
            {video.date}{video.author && ` ・ ${video.author}`}
          </p>

          {/* 資料リンク */}
          {video.materials.length > 0 && (
            <div className="border rounded-xl p-4 bg-gray-50 flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-600 mb-1">📎 資料</p>
              {video.materials.map((m, i) => (
                <a
                  key={i}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                >
                  <span className="flex-shrink-0">{materialIcon(m.url)}</span>
                  <span className="truncate">{m.label || m.url}</span>
                </a>
              ))}
            </div>
          )}

          {/* 外部リンクボタン（非YouTube） */}
          {!ytId && (
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              リンクを開く →
            </a>
          )}

          {ytId && (
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              YouTubeで見る →
            </a>
          )}

          {/* チャットワーク全文 */}
          {video.full_text && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">チャットワーク本文</p>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                {video.full_text}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CardThumbnail({ video }: { video: Video }) {
  const ytId = getYouTubeId(video.url);
  if (ytId) {
    return (
      <div className="relative aspect-video bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={video.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-white text-lg">▶</span>
          </div>
        </div>
      </div>
    );
  }
  // 非YouTube: カテゴリアイコン表示
  const icon = video.tags[0] === "アーカイブ" ? "🎓"
    : video.url.includes("notion") ? "📝"
    : video.url.includes("amzn") ? "📚"
    : video.url.includes("chrome") ? "🔌"
    : "🔗";
  return (
    <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <span className="text-5xl">{icon}</span>
    </div>
  );
}

export default function Home() {
  const videos: Video[] = data as Video[];
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Video | null>(null);

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
        v.full_text.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q));
      const matchTag = !activeTag || v.tags.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [videos, search, activeTag]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-gray-900">📺 伊藤YouTube講座 リンク集</h1>
          <input
            type="text"
            placeholder="キーワードで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeTag === null ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              すべて
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeTag === tag ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">{filtered.length} 件 / 全 {videos.length} 件</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v, i) => (
            <div
              key={i}
              onClick={() => setSelected(v)}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col cursor-pointer"
            >
              <CardThumbnail video={v} />
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                  {v.title || "（タイトルなし）"}
                </h2>
                {v.memo && <p className="text-xs text-gray-500 line-clamp-2">{v.memo}</p>}
                {v.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-2">
                    {v.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{v.date}</p>
                  <div className="flex gap-1">
                    {v.materials.length > 0 && <span className="text-xs text-orange-500">📎 資料</span>}
                    {v.full_text && <span className="text-xs text-blue-500">本文あり</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">該当するコンテンツが見つかりませんでした</div>
        )}
      </main>

      {selected && <Modal video={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
