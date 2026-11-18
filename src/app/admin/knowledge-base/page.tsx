"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Eye,
  X
} from "lucide-react";
import { TICKET_CATEGORIES } from "@/lib/constants";

interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  view_count: number;
  is_published: number;
  created_at: string;
  updated_at: string;
}

export default function AdminKnowledgeBasePage() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Technical Support");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter !== "All") params.set("category", categoryFilter);

      const res = await fetch(`/api/knowledge-base?${params.toString()}`);
      const data = await res.json();
      if (data.articles) setArticles(data.articles);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [search, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormTitle("");
    setFormCategory("Technical Support");
    setFormContent("");
    setFormTags("");
    setShowModal(true);
  };

  const handleOpenEdit = (art: KBArticle) => {
    setEditingId(art.id);
    setFormTitle(art.title);
    setFormCategory(art.category);
    setFormContent(art.content);
    setFormTags(art.tags);
    setShowModal(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await fetch(`/api/knowledge-base/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            category: formCategory,
            content: formContent.trim(),
            tags: formTags.trim()
          })
        });
      } else {
        await fetch("/api/knowledge-base", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            category: formCategory,
            content: formContent.trim(),
            tags: formTags.trim()
          })
        });
      }
      setShowModal(false);
      fetchArticles();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("CONFIRM DELETION OF THIS VERIFIED KNOWLEDGE BASE RECORD?")) return;
    try {
      await fetch(`/api/knowledge-base/${id}`, { method: "DELETE" });
      fetchArticles();
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono text-xs text-brand-black">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brand-black pb-4">
        <div>
          <span className="px-2 py-0.5 bg-brand-primary text-brand-accent text-[10px] font-bold uppercase border border-brand-accent">
            MODULE 06 // AI GROUNDING CORPUS
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black mt-1">
            KNOWLEDGE BASE DIRECTORY
          </h1>
          <p className="text-[11px] text-brand-black/60 uppercase">
            VERIFIED ARTICLES ANCHORING CHATBOT INFERENCE & SUGGESTED RESPONSES
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-brand-primary text-brand-white font-bold uppercase text-xs border-2 border-brand-black shadow-hard-green hover:bg-brand-accent hover:text-brand-black transition flex items-center"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          CREATE ARTICLE
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-brand-white border-2 border-brand-black p-4 shadow-hard flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-brand-black/50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FILTER TITLE, TAGS, CONTENT..."
            className="w-full text-xs font-mono bg-brand-offwhite border border-brand-black pl-9 pr-3 py-2 text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs font-bold uppercase bg-brand-offwhite border border-brand-black px-3 py-2 text-brand-black focus:outline-hidden"
        >
          <option value="All">CATEGORIES: ALL</option>
          {TICKET_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs font-bold uppercase text-brand-black/50">
            FETCHING KNOWLEDGE CORPUS...
          </div>
        ) : articles.length === 0 ? (
          <div className="col-span-full p-12 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-brand-black/30 mx-auto" />
            <p className="text-sm font-bold uppercase text-brand-black">NO KNOWLEDGE ARTICLES LOCATED</p>
          </div>
        ) : (
          articles.map((art) => (
            <div
              key={art.id}
              className="bg-brand-white border-2 border-brand-black p-5 shadow-hard flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-brand-black/20 pb-2">
                  <span className="px-2 py-0.5 bg-brand-offwhite border border-brand-black text-[10px] font-bold uppercase">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-brand-black/60 uppercase flex items-center font-bold">
                    <Eye className="w-3 h-3 mr-1 text-brand-primary" />
                    {art.view_count} QUERIES
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold uppercase text-brand-black mt-2 leading-tight">
                  {art.title}
                </h3>

                <p className="text-xs text-brand-black/80 mt-2 leading-relaxed whitespace-pre-wrap uppercase line-clamp-4">
                  {art.content}
                </p>

                {art.tags && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {art.tags.split(",").map((t) => (
                      <span key={t} className="text-[9px] bg-brand-black text-brand-accent px-1.5 py-0.2 font-bold uppercase">
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-brand-black/20 flex items-center justify-between">
                <span className="text-[10px] text-brand-black/60 uppercase">
                  VERIFIED: {new Date(art.updated_at).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(art)}
                    className="p-1 border border-brand-black hover:bg-brand-primary hover:text-brand-white transition"
                    title="Edit article"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(art.id)}
                    className="p-1 border border-brand-black hover:bg-brand-pink hover:text-brand-white transition"
                    title="Delete article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-brand-black/60 flex items-center justify-center p-4">
          <div className="bg-brand-white border-4 border-brand-black max-w-xl w-full p-6 shadow-hard space-y-4">
            <div className="flex items-center justify-between border-b-2 border-brand-black pb-2">
              <h3 className="font-heading text-2xl font-black uppercase text-brand-black">
                {editingId ? "EDIT KNOWLEDGE RECORD" : "PUBLISH KNOWLEDGE RECORD"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-brand-black hover:text-brand-pink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                  ARTICLE TITLE
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="E.G. HOW TO CONFIGURE SAML SSO AUTHENTICATION"
                  className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                  TAXONOMY CATEGORY
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full text-xs font-mono p-2 bg-brand-offwhite border-2 border-brand-black text-brand-black uppercase font-bold"
                >
                  {TICKET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                  VERIFIED DOCUMENTATION BODY
                </label>
                <textarea
                  required
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="PROVIDE VERIFIED TECHNICAL SPECIFICATIONS AND STEP-BY-STEP RESOLUTION PROCEDURES..."
                  className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black uppercase leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                  INDEXING TAGS (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="SSO, SAML, SECURITY, AUTH"
                  className="w-full text-xs font-mono p-2 bg-brand-offwhite border-2 border-brand-black text-brand-black uppercase"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border-2 border-brand-black text-brand-black font-bold uppercase text-xs hover:bg-brand-offwhite"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-primary text-brand-white font-bold uppercase text-xs border-2 border-brand-black hover:bg-brand-accent hover:text-brand-black shadow-hard-green"
                >
                  {saving ? "TRANSMITTING..." : editingId ? "UPDATE RECORD" : "PUBLISH RECORD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
