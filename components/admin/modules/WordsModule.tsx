'use client';

import React from 'react';
import { FileText, Plus, Trash2, Edit2, Upload, Download, Check, AlertCircle, Eye, Search, Layers } from 'lucide-react';
import { WORD_BANK, Difficulty } from '../../../lib/engine/words';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface WordItem {
  id: string;
  text: string;
  category: string;
  difficulty: Difficulty;
  enabled: boolean;
  createdAt: string;
}

interface WordsModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const WordsModule: React.FC<WordsModuleProps> = ({ currentRole, onShowToast }) => {
  const [words, setWords] = React.useState<WordItem[]>(() => {
    const list: WordItem[] = [];
    Object.entries(WORD_BANK).forEach(([cat, diffs]) => {
      (['easy', 'medium', 'hard'] as const).forEach((diff) => {
        diffs[diff].forEach((w, idx) => {
          list.push({
            id: `w-${cat}-${diff}-${idx}`,
            text: w,
            category: cat,
            difficulty: diff,
            enabled: true,
            createdAt: new Date().toISOString().split('T')[0],
          });
        });
      });
    });
    return list;
  });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('all');
  const [newWordText, setNewWordText] = React.useState('');
  const [newWordCategory, setNewWordCategory] = React.useState('space');
  const [newWordDifficulty, setNewWordDifficulty] = React.useState<Difficulty>('medium');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const canEdit = can(currentRole, 'manage_words');

  const filteredWords = words.filter((w) => {
    const matchesSearch = w.text.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesCat = selectedCategory === 'all' || w.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'all' || w.difficulty === selectedDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const trimmed = newWordText.trim().toLowerCase();
    if (trimmed.length < 2 || trimmed.length > 32) {
      onShowToast('Word must be between 2 and 32 characters.');
      return;
    }

    if (words.some((w) => w.text.toLowerCase() === trimmed)) {
      onShowToast(`Word '${trimmed}' already exists in word bank.`);
      return;
    }

    const newWord: WordItem = {
      id: `w-custom-${Date.now()}`,
      text: trimmed,
      category: newWordCategory,
      difficulty: newWordDifficulty,
      enabled: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setWords([newWord, ...words]);
    setNewWordText('');
    onShowToast(`Word '${trimmed}' added.`);
    playSound('click');
  };

  const handleDeleteWord = (id: string) => {
    if (!canEdit) return;
    setWords(words.filter((w) => w.id !== id));
    onShowToast('Word deleted.');
    playSound('click');
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (!canEdit || selectedIds.size === 0) return;
    setWords(words.filter((w) => !selectedIds.has(w.id)));
    onShowToast(`${selectedIds.size} words deleted.`);
    setSelectedIds(new Set());
    playSound('click');
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(words, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spacedraw-words-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported word bank JSON.');
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Word Bank Manager
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Full CRUD, categories, import/export, and in-game word selection preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Add New Word Form */}
      {canEdit && (
        <form onSubmit={handleAddWord} className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-end gap-3 border border-[var(--border)]">
          <div className="flex-1 space-y-1">
            <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">New Secret Word</label>
            <input
              type="text"
              value={newWordText}
              onChange={(e) => setNewWordText(e.target.value)}
              placeholder="e.g. supernova, rocket, satellite"
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">Category</label>
            <select
              value={newWordCategory}
              onChange={(e) => setNewWordCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-mono"
            >
              {Object.keys(WORD_BANK).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">Difficulty</label>
            <select
              value={newWordDifficulty}
              onChange={(e) => setNewWordDifficulty(e.target.value as Difficulty)}
              className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-mono"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Word</span>
          </button>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)]"
          >
            <option value="all">All Categories</option>
            {Object.keys(WORD_BANK).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)]"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {selectedIds.size > 0 && canEdit && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* Words Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="sticky top-0 bg-[var(--bg-tertiary)] border-b border-[var(--border)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(filteredWords.map((w) => w.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                  />
                </th>
                <th className="p-3">Word</th>
                <th className="p-3">Category</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">Added</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredWords.map((word) => (
                <tr key={word.id} className="hover:bg-[var(--bg-hover)]">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(word.id)}
                      onChange={() => handleToggleSelect(word.id)}
                    />
                  </td>
                  <td className="p-3 font-bold text-[var(--text-primary)] uppercase">{word.text}</td>
                  <td className="p-3 text-[var(--text-secondary)] capitalize">{word.category}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)] text-[10px] capitalize">
                      {word.difficulty}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">{word.createdAt}</td>
                  <td className="p-3 text-right">
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteWord(word.id)}
                        className="p-1 hover:text-[var(--text-primary)] text-[var(--text-secondary)]"
                        title="Delete word"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
