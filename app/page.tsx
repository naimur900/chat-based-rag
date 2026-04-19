"use client";
import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";

type SavedChat = {
  id: string;
  title: string;
  messages: { id: string; role: string; text: string; time: string }[];
  createdAt: string;
};

const LS_CHATS = "rag_chats";
const LS_ARCHIVES = "rag_archives";

function loadFromLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToLS(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

function titleFromText(text: string) {
  const clean = text.replace(/\n/g, " ").trim();
  return clean.length > 40 ? clean.slice(0, 40) + "..." : clean;
}

export default function Home() {
  // --- Sidebar view: "chats" or "archive" ---
  const [view, setView] = useState<"chats" | "archive">("chats");

  // --- Chat history stored in localStorage ---
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [archives, setArchives] = useState<SavedChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setSavedChats(loadFromLS<SavedChat[]>(LS_CHATS, []));
    setArchives(loadFromLS<SavedChat[]>(LS_ARCHIVES, []));
  }, []);

  // --- useChat for the active conversation ---
  const { messages, sendMessage, status, setMessages } = useChat();
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Persist current chat messages to localStorage whenever they change
  useEffect(() => {
    if (!activeChatId || messages.length === 0) return;
    setSavedChats((prev) => {
      const serialized = messages.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.parts
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join(""),
        time: formatTime(new Date()),
      }));
      const firstUserMsg = serialized.find((m) => m.role === "user");
      const updated = prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              messages: serialized,
              title: firstUserMsg
                ? titleFromText(firstUserMsg.text)
                : c.title,
            }
          : c
      );
      saveToLS(LS_CHATS, updated);
      return updated;
    });
  }, [messages, activeChatId]);

  // --- Actions ---
  const startNewChat = useCallback(() => {
    const id = generateId();
    const chat: SavedChat = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setSavedChats((prev) => {
      const next = [chat, ...prev];
      saveToLS(LS_CHATS, next);
      return next;
    });
    setActiveChatId(id);
    setMessages([]);
    setView("chats");
  }, [setMessages]);

  const loadChat = useCallback(
    (chat: SavedChat) => {
      setActiveChatId(chat.id);
      // Reconstruct UIMessage-compatible objects from saved data
      const restored = chat.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: m.text }],
      }));
      setMessages(restored);
      setView("chats");
    },
    [setMessages]
  );

  const archiveChat = useCallback(
    (chatId: string) => {
      setSavedChats((prev) => {
        const target = prev.find((c) => c.id === chatId);
        if (!target) return prev;
        const next = prev.filter((c) => c.id !== chatId);
        saveToLS(LS_CHATS, next);
        setArchives((aPrev) => {
          const archiveNext = [target, ...aPrev];
          saveToLS(LS_ARCHIVES, archiveNext);
          return archiveNext;
        });
        return next;
      });
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    },
    [activeChatId, setMessages]
  );

  const restoreFromArchive = useCallback(
    (chatId: string) => {
      setArchives((prev) => {
        const target = prev.find((c) => c.id === chatId);
        if (!target) return prev;
        setSavedChats((cPrev) => {
          const next = [target, ...cPrev];
          saveToLS(LS_CHATS, next);
          return next;
        });
        const next = prev.filter((c) => c.id !== chatId);
        saveToLS(LS_ARCHIVES, next);
        return next;
      });
    },
    []
  );

  const deleteArchived = useCallback((chatId: string) => {
    setArchives((prev) => {
      const next = prev.filter((c) => c.id !== chatId);
      saveToLS(LS_ARCHIVES, next);
      return next;
    });
  }, []);

  const deleteChat = useCallback(
    (chatId: string) => {
      setSavedChats((prev) => {
        const next = prev.filter((c) => c.id !== chatId);
        saveToLS(LS_CHATS, next);
        return next;
      });
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    },
    [activeChatId, setMessages]
  );

  function handleSubmit(e?: React.SyntheticEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    // Auto-create a chat if none is active
    if (!activeChatId) {
      const id = generateId();
      const chat: SavedChat = {
        id,
        title: titleFromText(input),
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setSavedChats((prev) => {
        const next = [chat, ...prev];
        saveToLS(LS_CHATS, next);
        return next;
      });
      setActiveChatId(id);
    }
    sendMessage({ role: "user", parts: [{ type: "text", text: input }] });
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const activeChat = savedChats.find((c) => c.id === activeChatId);

  return (
    <div className="h-screen flex overflow-hidden font-body">
      {/* Scanline Overlay */}
      <div className="fixed inset-0 scanlines z-[100] opacity-10 pointer-events-none" />

      {/* Sidebar */}
      <aside className="flex flex-col h-screen w-72 shrink-0 bg-surface border-r border-outline-variant/10 z-50">
        {/* Brand */}
        <div className="p-6 pb-4">
          <div className="font-black text-[#00F0FF] tracking-tighter text-xl italic font-headline mb-1">
            DocQuery
          </div>
          <div className="uppercase tracking-widest text-[10px] text-[#00F0FF]/60 font-label">
            Knowledge Base
          </div>
        </div>

        {/* New chat button */}
        <div className="px-6 pb-4">
          <button
            onClick={startNewChat}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-3 px-4 font-label text-xs tracking-widest uppercase font-bold flex items-center justify-between hover:opacity-90 transition-all active:scale-95"
          >
            New Chat
            <span className="material-symbols-outlined text-sm">
              add_circle
            </span>
          </button>
        </div>

        {/* Nav tabs */}
        <nav className="px-6 space-y-1 mb-4">
          <button
            onClick={() => setView("chats")}
            className={`w-full flex items-center gap-4 px-4 py-2 font-label uppercase tracking-widest text-xs transition-all duration-300 ${
              view === "chats"
                ? "text-secondary border-l-2 border-secondary"
                : "text-[#00F0FF]/60 hover:text-[#00F0FF] hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              chat_bubble
            </span>
            <span>Chats</span>
            {savedChats.length > 0 && (
              <span className="ml-auto font-label text-[9px] text-on-surface-variant">
                {savedChats.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setView("archive")}
            className={`w-full flex items-center gap-4 px-4 py-2 font-label uppercase tracking-widest text-xs transition-all duration-300 ${
              view === "archive"
                ? "text-secondary border-l-2 border-secondary"
                : "text-[#00F0FF]/60 hover:text-[#00F0FF] hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              folder_managed
            </span>
            <span>Archive</span>
            {archives.length > 0 && (
              <span className="ml-auto font-label text-[9px] text-on-surface-variant">
                {archives.length}
              </span>
            )}
          </button>
        </nav>

        {/* Chat / Archive list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-outline-variant/10">
          {view === "chats" && (
            <>
              {savedChats.length === 0 && (
                <div className="p-6 text-center">
                  <p className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
                    No conversations yet
                  </p>
                </div>
              )}
              {savedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                    activeChatId === chat.id
                      ? "border-l-2 border-secondary bg-surface-container-high/50"
                      : "hover:bg-surface-container-high border-l-2 border-transparent"
                  }`}
                  onClick={() => loadChat(chat)}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-9 h-9 border flex items-center justify-center ${
                        activeChatId === chat.id
                          ? "border-secondary/40"
                          : "border-primary/20"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-base ${
                          activeChatId === chat.id
                            ? "text-secondary"
                            : "text-primary/60"
                        }`}
                      >
                        chat
                      </span>
                    </div>
                    {activeChatId === chat.id && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-secondary shadow-[0_0_6px_#ff59e3]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-headline font-bold text-xs tracking-tight truncate ${
                        activeChatId === chat.id
                          ? "text-secondary"
                          : "text-primary/60"
                      }`}
                    >
                      {chat.title}
                    </div>
                    <div className="font-label text-[8px] text-on-surface-variant">
                      {chat.messages.length} messages
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveChat(chat.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-surface-variant transition-colors"
                      title="Archive"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-sm hover:text-tertiary">
                        archive
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-surface-variant transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-sm hover:text-error">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {view === "archive" && (
            <>
              {archives.length === 0 && (
                <div className="p-6 text-center">
                  <p className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
                    Archive empty
                  </p>
                </div>
              )}
              {archives.map((chat) => (
                <div
                  key={chat.id}
                  className="group p-4 flex items-center gap-3 cursor-pointer hover:bg-surface-container-high transition-colors border-l-2 border-transparent"
                  onClick={() => {
                    restoreFromArchive(chat.id);
                    loadChat(chat);
                  }}
                >
                  <div className="w-9 h-9 border border-tertiary/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary/60 text-base">
                      inventory_2
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-headline font-bold text-xs tracking-tight text-tertiary/80 truncate">
                      {chat.title}
                    </div>
                    <div className="font-label text-[8px] text-on-surface-variant">
                      {chat.messages.length} messages
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        restoreFromArchive(chat.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-surface-variant transition-colors"
                      title="Restore"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-sm hover:text-primary">
                        unarchive
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteArchived(chat.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-surface-variant transition-colors"
                      title="Delete permanently"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-sm hover:text-error">
                        delete_forever
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col relative h-full bg-surface">
        {/* Thread Header */}
        <div className="h-14 border-b border-outline-variant/10 flex items-center justify-between px-8 bg-surface-container-low/30 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 bg-secondary shadow-[0_0_10px_#ff59e3]" />
            <div>
              <h1 className="font-headline font-black text-sm tracking-wider text-on-surface uppercase italic">
                {activeChat ? activeChat.title : "DocQuery"}
              </h1>
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 ${isLoading ? "bg-secondary animate-pulse shadow-[0_0_5px_#ff59e3]" : "bg-tertiary shadow-[0_0_5px_#8eff71]"}`}
                />
                <span className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase">
                  {isLoading ? "Processing" : "Ready"}
                </span>
              </div>
            </div>
          </div>
          {activeChat && (
            <button
              onClick={() => archiveChat(activeChat.id)}
              className="h-8 px-3 border border-outline-variant/20 flex items-center gap-2 hover:border-tertiary transition-all group"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-sm group-hover:text-tertiary">
                archive
              </span>
              <span className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase group-hover:text-tertiary">
                Archive
              </span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full space-y-8 py-8">
              <div className="w-16 h-16 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/40 text-3xl">
                  menu_book
                </span>
              </div>
              <div className="text-center space-y-2">
                <p className="font-headline text-sm uppercase tracking-widest text-primary/60">
                  Ask Your Knowledge Base
                </p>
                <p className="font-body text-xs text-on-surface-variant/40 max-w-md">
                  This knowledge base covers{" "}
                  <span className="text-primary/60">Clean Code</span>,{" "}
                  <span className="text-primary/60">Design Patterns</span>,{" "}
                  <span className="text-primary/60">Refactoring</span>,{" "}
                  <span className="text-primary/60">SOLID Principles</span>,{" "}
                  <span className="text-primary/60">System Design</span>, and{" "}
                  <span className="text-primary/60">Testing Best Practices</span>.
                  Click a suggestion or type your own question.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  {
                    icon: "code",
                    tag: "Clean Code",
                    question: "What are the principles of writing clean, readable code?",
                  },
                  {
                    icon: "architecture",
                    tag: "Design Patterns",
                    question: "When should I use the Factory pattern vs the Builder pattern?",
                  },
                  {
                    icon: "build",
                    tag: "Refactoring",
                    question: "What are common code smells and how do I refactor them?",
                  },
                  {
                    icon: "rule",
                    tag: "SOLID",
                    question: "Can you explain the Single Responsibility Principle with an example?",
                  },
                  {
                    icon: "storage",
                    tag: "System Design",
                    question: "How do I design a scalable system with high availability?",
                  },
                  {
                    icon: "science",
                    tag: "Testing",
                    question: "What is the difference between unit, integration, and end-to-end tests?",
                  },
                ].map(({ icon, tag, question }) => (
                  <button
                    key={tag}
                    onClick={() => setInput(question)}
                    className="flex items-start gap-3 p-4 border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-high/40 transition-all text-left group"
                  >
                    <span className="material-symbols-outlined text-primary/40 text-base group-hover:text-primary/70 shrink-0 mt-0.5">
                      {icon}
                    </span>
                    <div className="min-w-0">
                      <div className="font-label text-[9px] uppercase tracking-widest text-secondary/60 mb-1">
                        {tag}
                      </div>
                      <div className="font-body text-xs text-on-surface-variant/60 group-hover:text-on-surface-variant leading-relaxed">
                        {question}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {Array.from(new Map(messages.map((m) => [m.id, m])).values()).map((m, idx, arr) => {
            const isUser = m.role === "user";
            const isStreamingThis =
              isLoading &&
              !isUser &&
              idx === arr.length - 1;
            const text = m.parts
              .filter(
                (p): p is { type: "text"; text: string } => p.type === "text"
              )
              .map((p) => p.text)
              .join("");

            return (
              <div key={m.id}>
                {isUser ? (
                  <div className="flex items-start gap-3 max-w-2xl ml-auto flex-row-reverse">
                    <div className="w-8 h-8 border border-primary/30 shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">
                        person
                      </span>
                    </div>
                    <div className="glass-panel neon-border-cyan p-4">
                      <div className="flex items-center justify-between mb-2 gap-6">
                        <span className="font-label text-[9px] text-primary font-bold uppercase tracking-widest">
                          You
                        </span>
                      </div>
                      <p className="font-body text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
                        {text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 max-w-2xl">
                    <div className="w-8 h-8 border border-secondary/30 shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-sm">
                        smart_toy
                      </span>
                    </div>
                    <div className="glass-panel neon-border-pink p-4">
                      <div className="flex items-center justify-between mb-2 gap-6">
                        <span className="font-label text-[9px] text-secondary font-bold uppercase tracking-widest">
                          Assistant
                        </span>
                      </div>
                      <p className="font-body text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
                        {text}
                        {isStreamingThis && (
                          <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-secondary align-middle animate-[blink_0.7s_step-end_infinite]" />
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex items-start gap-3 max-w-2xl">
              <div className="w-8 h-8 border border-secondary/30 shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-sm animate-pulse">
                  smart_toy
                </span>
              </div>
              <div className="glass-panel neon-border-pink p-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary animate-pulse shadow-[0_0_5px_#ff59e3]" />
                  <span className="font-label text-[9px] text-secondary uppercase tracking-widest font-bold">
                    Searching documents...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-surface-container-low/50 backdrop-blur-xl border-t border-outline-variant/10 shrink-0">
          <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                className="w-full bg-surface-container-high/40 border-b-2 border-outline-variant/30 focus:border-primary transition-all p-4 font-body text-sm text-on-surface placeholder:text-on-surface-variant/30 resize-none min-h-[50px] focus:ring-0 outline-none"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
              />
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center shadow-[0_0_20px_rgba(143,245,255,0.3)] hover:brightness-110 active:scale-90 transition-all disabled:opacity-50"
            >
              <span
                className="material-symbols-outlined font-black"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
            </button>
          </div>
          <div className="mt-3 max-w-4xl mx-auto flex justify-between">
            <div className="font-label text-[8px] tracking-[0.2em] text-on-surface-variant uppercase">
              {input.length > 0 ? `${input.length} chars` : "Ready"}
            </div>
            <div className="font-label text-[8px] tracking-[0.2em] text-secondary uppercase font-bold">
              {isLoading ? "Searching..." : "Send to ask"}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
