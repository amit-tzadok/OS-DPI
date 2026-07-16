import { useState, useEffect } from "react";
import db from "app/db.js";
import "css/home.css";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    title: "Symbol boards",
    desc: "Build picture-based grids with images, text, or both.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
    title: "Any access method",
    desc: "Mouse, touch, switch scanning, or eye gaze — your choice.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    ),
    title: "Fully customizable",
    desc: "Your vocabulary, layout, and speaking rules — all yours.",
  },
];

function EmptyState({ onNew }) {
  return (
    <div className="hs-empty">
      <p className="hs-empty-prompt">Create your first board to get started.</p>
      <div className="hs-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="hs-feature">
            <div className="hs-feature-icon">{f.icon}</div>
            <h3 className="hs-feature-title">{f.title}</h3>
            <p className="hs-feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeScreen() {
  const [boards, setBoards] = useState(/** @type {string[] | null} */ (null));
  const [savedBoards, setSavedBoards] = useState(/** @type {string[]} */ ([]));
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [names, saved] = await Promise.all([db.names(), db.saved()]);
      setBoards(names);
      setSavedBoards(saved);
    }
    load();
  }, []);

  async function handleNew() {
    const name = await db.uniqueName("new");
    window.location.hash = name;
  }

  /** Copy the DEAN example into a fresh design and open it */
  async function handleTemplate() {
    try {
      const { default: pleaseWait } = await import("components/wait");
      const name = await db.uniqueName("DEAN");
      await pleaseWait(db.readDesignFromURL("examples/DEAN.osdpi", name));
      window.location.hash = db.designName;
    } catch (e) {
      setError(
        `Could not load the DEAN template${e instanceof Error ? `: ${e.message}` : ""}`,
      );
    }
  }

  /** New blank board, opening straight into the designer's AI generator */
  async function handleAI() {
    // consumed by the Content panel on the next load
    localStorage.setItem("osdpi-open-ai-generator", "1");
    const name = await db.uniqueName("new");
    window.location.hash = name;
  }

  /** @param {string} name */
  function handleOpen(name) {
    window.location.hash = name;
  }

  const hasBoards = boards !== null && boards.length > 0;

  return (
    <div className="hs-root">
      {/* ── Header ── */}
      <header className="hs-header">
        <span className="hs-brand">OS-DPI</span>
        <h1 className="hs-title">Communication Board Builder</h1>
        <p className="hs-subtitle">
          Design AAC boards for any speaker, any access method.
        </p>
      </header>

      {/* ── Body ── */}
      <div className="hs-layout">
        {/* Left column — actions */}
        <aside className="hs-sidebar">
          <button className="hs-new-btn" onClick={handleNew}>
            <svg className="hs-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Blank Board
          </button>

          <button className="hs-choice" onClick={handleTemplate}>
            <span className="hs-choice-title">🗣️ DEAN Conversation Board</span>
            <span className="hs-choice-desc">
              Start from the DEAN template — a ready-made conversation board
              with live AI response suggestions.
            </span>
          </button>

          <button className="hs-choice" onClick={handleAI}>
            <span className="hs-choice-title">✨ Generate with AI</span>
            <span className="hs-choice-desc">
              Describe the board you want and let AI build the vocabulary and
              layout for you.
            </span>
          </button>

          {error && <p className="hs-error" role="alert">{error}</p>}

          <div className="hs-divider"><span>or</span></div>

          <a className="hs-secondary-btn" href="#import-file" onClick={(e) => {
            e.preventDefault();
            // Open a hidden file picker that feeds into db
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".osdpi,.zip";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              const { default: pleaseWait } = await import("components/wait");
              await pleaseWait(db.readDesignFromFile(file));
              window.location.hash = db.designName;
            };
            input.click();
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import file
          </a>
        </aside>

        {/* Right column — board list */}
        <main className="hs-main">
          {boards === null ? (
            <p className="hs-loading">Loading…</p>
          ) : hasBoards ? (
            <>
              <h2 className="hs-section-label">Your boards</h2>
              <div className="hs-grid" role="list">
                {boards.map((name) => {
                  const initials = name.slice(0, 2).toUpperCase();
                  const isSaved = savedBoards.includes(name);
                  return (
                    <button
                      key={name}
                      className="hs-card"
                      role="listitem"
                      onClick={() => handleOpen(name)}
                      aria-label={`Open board: ${name}`}
                    >
                      <div className="hs-card-avatar" aria-hidden="true">
                        {initials}
                      </div>
                      <span className="hs-card-name">{name}</span>
                      {!isSaved && (
                        <span
                          className="hs-card-badge"
                          title="Stored on this device but not exported — use File → Download Backup in the editor to keep an .osdpi copy"
                        >
                          No backup
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState onNew={handleNew} />
          )}
        </main>
      </div>
    </div>
  );
}
