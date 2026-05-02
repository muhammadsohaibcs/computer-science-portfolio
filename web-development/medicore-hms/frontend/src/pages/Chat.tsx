import {
  MessageCircle, MessageSquare, Paperclip, RefreshCw,
  Search, Send, User, Users,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getDoctors } from '../api/doctors.api';
import { getMessages, getUnreadCount, listConversations, sendMessage, startConversation } from '../api/chat.api';
import { getStaff } from '../api/staff.api';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Select from '../components/common/Select';
import Toast from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage, Conversation } from '../types/chat.types';
import { Doctor } from '../types/doctor.types';
import { Staff } from '../types/staff.types';

const POLL_MS = 5000; // 5-second polling for near-real-time

/* ── helpers ──────────────────────────────────────────────────────── */
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-brand-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-teal-500', 'bg-rose-500', 'bg-indigo-500', 'bg-orange-500',
];
function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/* ── Component ────────────────────────────────────────────────────── */
const Chat: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState<{ id: string; label: string }[]>([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* fetch conversations */
  const fetchConvs = useCallback(async () => {
    try {
      const data = await listConversations();
      setConversations(data);
    } catch { /* silent */ }
    finally { setLoadingConvs(false); }
  }, []);

  /* fetch messages for active conversation */
  const fetchMessages = useCallback(async (convId: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const res = await getMessages(convId);
      setMessages(res.data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } catch { /* silent */ }
    finally { setLoadingMsgs(false); }
  }, []);

  /* initial load */
  useEffect(() => {
    fetchConvs();
    getUnreadCount().then(setUnread).catch(() => {});
  }, [fetchConvs]);

  /* load contacts for new-chat dropdown */
  useEffect(() => {
    if (!showNewChat) return;
    Promise.all([getDoctors({ limit: 200 }), getStaff({ limit: 200 })])
      .then(([docs, stf]) => {
        const d = docs.data.map((dc: Doctor) => ({ id: dc._id, label: `Dr. ${dc.name} (Doctor)` }));
        const s = stf.data.map((st: Staff) => ({ id: st._id, label: `${st.name} (${st.roleTitle || 'Staff'})` }));
        setContacts([...d, ...s]);
      }).catch(() => {});
  }, [showNewChat]);

  /* start polling when a conversation is active */
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeConv) return;
    fetchMessages(activeConv._id);
    pollRef.current = setInterval(() => {
      fetchMessages(activeConv._id, true);
      fetchConvs();
      getUnreadCount().then(setUnread).catch(() => {});
    }, POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConv?._id]);

  const handleSend = async () => {
    if (!activeConv || !text.trim()) return;
    setSending(true);
    const draft = text.trim();
    setText('');
    try {
      const msg = await sendMessage(activeConv._id, draft);
      setMessages(p => [...p, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      fetchConvs();
    } catch {
      setText(draft);
      setToast({ msg: 'Failed to send message', type: 'error' });
    } finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleStartConversation = async () => {
    if (!selectedContact) return;
    try {
      const conv = await startConversation(selectedContact);
      setShowNewChat(false); setSelectedContact('');
      setActiveConv(conv);
      await fetchConvs();
    } catch { setToast({ msg: 'Failed to start conversation', type: 'error' }); }
  };

  const filtered = conversations.filter(c =>
    c.participants.some(p => p.username?.toLowerCase().includes(search.toLowerCase()))
  );

  const getOther = (c: Conversation) =>
    c.participants.find(p => p._id !== user?.id) || c.participants[0];

  return (
    <Layout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col h-[calc(100vh-60px-48px)] -m-4 sm:-m-6">
        <div className="flex h-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-card">

          {/* ── Left panel: Conversation list ── */}
          <div className={`${activeConv ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 border-r border-slate-100 dark:border-slate-800 flex-shrink-0`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span className="font-700 text-slate-900 dark:text-white text-sm">Messages</span>
                {unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-2xs flex items-center justify-center font-700">{unread}</span>
                )}
              </div>
              <button
                onClick={() => setShowNewChat(true)}
                className="p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                title="New conversation"
              >
                <Users className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <Loading size="sm" text="Loading…" />
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-600 text-slate-500 dark:text-slate-400">No conversations yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start a new chat with your doctor or staff</p>
                  <button onClick={() => setShowNewChat(true)} className="mt-4 px-4 py-2 text-xs font-600 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
                    New Conversation
                  </button>
                </div>
              ) : (
                filtered.map(conv => {
                  const other = getOther(conv);
                  const isActive = activeConv?._id === conv._id;
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConv(conv)}
                      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 transition-colors text-left ${isActive ? 'bg-brand-50 dark:bg-brand-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-700 flex-shrink-0 ${avatarColor(other?.username || 'U')}`}>
                        {initials(other?.username || 'U')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-sm truncate ${isActive ? 'font-700 text-brand-700 dark:text-brand-300' : 'font-600 text-slate-800 dark:text-slate-200'}`}>
                            {other?.username || 'Unknown'}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-2xs text-slate-400 flex-shrink-0">{formatTime((conv.lastMessage as any).createdAt)}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {(conv.lastMessage as any)?.text || 'No messages yet'}
                        </p>
                        <span className="text-2xs text-slate-400 capitalize">{other?.role}</span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-4.5 h-4.5 min-w-[18px] rounded-full bg-brand-600 text-white text-2xs flex items-center justify-center font-700 flex-shrink-0 mt-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right panel: Message thread ── */}
          <div className={`${!activeConv ? 'hidden sm:flex' : 'flex'} flex-col flex-1 min-w-0`}>
            {!activeConv ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                  <p className="text-base font-700 text-slate-700 dark:text-slate-300">Select a conversation</p>
                  <p className="text-sm text-slate-400 mt-1">Or start a new chat with your doctor or care team</p>
                </div>
                <button onClick={() => setShowNewChat(true)} className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-600 hover:bg-brand-700 transition-colors">
                  New Conversation
                </button>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                  <button onClick={() => setActiveConv(null)} className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    ←
                  </button>
                  {(() => {
                    const other = getOther(activeConv);
                    return (
                      <>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-700 flex-shrink-0 ${avatarColor(other?.username || 'U')}`}>
                          {initials(other?.username || 'U')}
                        </div>
                        <div>
                          <p className="text-sm font-700 text-slate-900 dark:text-white">{other?.username}</p>
                          <p className="text-xs text-slate-400 capitalize">{other?.role}</p>
                        </div>
                      </>
                    );
                  })()}
                  <button onClick={() => fetchMessages(activeConv._id)} className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Refresh">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {loadingMsgs ? <Loading size="sm" /> : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                      <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-400">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender._id === user?.id || msg.sender.username === user?.username;
                      return (
                        <div key={msg._id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMe && (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-2xs font-700 flex-shrink-0 ${avatarColor(msg.sender.username || 'U')}`}>
                              {initials(msg.sender.username || 'U')}
                            </div>
                          )}
                          <div className={`max-w-[70%] group`}>
                            {!isMe && (
                              <p className="text-2xs text-slate-400 mb-1 ml-1">{msg.sender.username}</p>
                            )}
                            <div className={`
                              px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                              ${isMe
                                ? 'bg-brand-600 text-white rounded-br-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'
                              }
                            `}>
                              {msg.text}
                            </div>
                            <p className={`text-2xs text-slate-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                              {formatTime(msg.createdAt)}
                              {isMe && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                        rows={1}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none overflow-hidden"
                        style={{ minHeight: '42px', maxHeight: '120px' }}
                        disabled={sending}
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!text.trim() || sending}
                      className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                      title="Send (Enter)"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-2xs text-slate-400 mt-1.5 text-center">Messages refresh every 5 seconds</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal isOpen={showNewChat} onClose={() => { setShowNewChat(false); setSelectedContact(''); }}
        title="New Conversation" subtitle="Select a doctor or staff member to message" size="sm">
        <div className="space-y-4">
          <Select
            label="Select Recipient" name="contact" value={selectedContact}
            onChange={e => setSelectedContact(e.target.value)}
            options={contacts.map(c => ({ value: c.id, label: c.label }))}
            placeholder="Search doctors & staff…"
          />
          <div className="flex gap-3">
            <button onClick={() => { setShowNewChat(false); setSelectedContact(''); }}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleStartConversation} disabled={!selectedContact}
              className="flex-1 py-2 rounded-xl bg-brand-600 text-white text-sm font-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Start Chat
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Chat;
