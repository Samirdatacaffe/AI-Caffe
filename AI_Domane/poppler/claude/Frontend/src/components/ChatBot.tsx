import React, { useState, useRef, useEffect, useMemo } from 'react';
import logo from '../assets/aicaffe-logo.png';
import { useTheme } from '../context/ThemeContext';
import { createT } from '../translations';
import styles from './ChatBot.module.css';

interface ChatBotProps {
  userName: string;
  userLastName: string;
  userEmail: string;
  topics: string[];
  onLogout: () => void;
}

interface MessageAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  storagePath: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: MessageAttachment[];
}

interface ModelSwitchEvent {
  previousModel: string;
  newModel: string;
  summary: string;
  afterMessageIndex: number; // Insert divider after this message index
}



const QUICK_ACTIONS = [
  { id: 'esg', label: 'ESG', icon: '🌱' },
  { id: 'election', label: 'Election', icon: '🗳️' },
  { id: 'workforce', label: 'Workforce', icon: '👥' },
  { id: 'datacaffe', label: 'DataCaffe', icon: '☕' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
];

const SOLUTION_MODELS = [
  { id: 'brew-generic-0.5', label: 'Brew Generic 0.5' },
  { id: 'brew-esg-1.2', label: 'Brew ESG 1.2' },
  { id: 'brew-ec-2.5', label: 'Brew EC 2.5' },
  { id: 'brew-dc-3.1', label: 'Brew DC 3.1' },
];

const AI_MODELS = [
  { id: 'kimi-k2.5', label: 'Kimi-k2.5' },
  { id: 'qwen3.5:397b', label: 'Qwen 3.5' },
  { id: 'qwen3-coder:480b', label: 'Qwen3-Coder' },
  { id: 'mistral-large-3:675b', label: 'Mistral-Large-3' },
  { id: 'gpt-oss:20b', label: 'GPT-OSS' },
  // ── Local llama.cpp models (running on this Mac Mini) ──
  { id: 'llama-1b', label: '🖥️ Llama 1B (Local)' },
  { id: 'deepseek-1b', label: '🖥️ DeepSeek 1B (Local)' },
  { id: 'r1-1b', label: '🖥️ R1 1B (Local)' },
];

const ChatBot: React.FC<ChatBotProps> = ({ userName, userLastName, userEmail, topics, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeMainConvId, setActiveMainConvId] = useState<string | null>(null);
  const [chatHistoryList, setChatHistoryList] = useState<{ id: string; title: string; projectId: string | null; projectName: string | null; updatedAt: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedSolution, setSelectedSolution] = useState(SOLUTION_MODELS[0]);
  const [solutionDropdownOpen, setSolutionDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [modelSwitchEvents, setModelSwitchEvents] = useState<ModelSwitchEvent[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [chatMenuId, setChatMenuId] = useState<string | null>(null);
  const [chatsPageOpen, setChatsPageOpen] = useState(false);
  const [chatsSearch, setChatsSearch] = useState('');
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState('');
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>(() => (localStorage.getItem('lang') as 'en' | 'hi') || 'en');
  const t = useMemo(() => createT(selectedLanguage), [selectedLanguage]);
  useEffect(() => { localStorage.setItem('lang', selectedLanguage); }, [selectedLanguage]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradePlanTab, setUpgradePlanTab] = useState<'individual' | 'team'>('individual');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim = transcript;
        }
      }
      setInput(() => finalTranscript + interim);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  // Search overlay state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchProjects, setSearchProjects] = useState<{ id: string; name: string; description: string | null; color: string | null; icon: string | null; createdAt: string; updatedAt: string }[]>([]);
  const [searchChats, setSearchChats] = useState<{ id: string; title: string; updatedAt: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHighlight, setSearchHighlight] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Projects state
  interface ProjectData {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    createdAt: string;
    updatedAt: string;
  }
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [projectsView, setProjectsView] = useState<'list' | 'detail' | 'create' | 'edit' | 'conversation'>('list');
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectSort, setProjectSort] = useState<'activity' | 'created'>('activity');
  const [projectSortOpen, setProjectSortOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [projectSaving, setProjectSaving] = useState(false);

  const fetchProjects = async (search?: string, sort?: string) => {
    setProjectsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search || projectSearch) params.set('search', search ?? projectSearch);
      params.set('sort', sort ?? projectSort);
      const res = await fetch(`/api/projects?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch { /* ignore */ }
    finally { setProjectsLoading(false); }
  };

  const createProject = async () => {
    if (!projectForm.name.trim()) return;
    setProjectSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: projectForm.name.trim(), description: projectForm.description.trim() || null }),
      });
      if (res.ok) {
        setProjectForm({ name: '', description: '' });
        setProjectsView('list');
        await fetchProjects();
      }
    } catch { /* ignore */ }
    finally { setProjectSaving(false); }
  };

  const updateProject = async () => {
    if (!selectedProject || !projectForm.name.trim()) return;
    setProjectSaving(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: projectForm.name.trim(), description: projectForm.description.trim() || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProject(data.project);
        setProjectsView('detail');
        await fetchProjects();
      }
    } catch { /* ignore */ }
    finally { setProjectSaving(false); }
  };

  // Conversation state
  interface ConversationData {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    _count?: { messages: number };
  }
  interface MessageData {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
  }
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationData | null>(null);
  const [conversationMessages, setConversationMessages] = useState<MessageData[]>([]);
  const [projectChatInput, setProjectChatInput] = useState('');
  const [projectChatLoading, setProjectChatLoading] = useState(false);
  const projectMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    projectMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const fetchConversations = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/conversations`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch { /* ignore */ }
  };

  // ── SSE stream reader for project conversations (updates conversationMessages) ──
  const startConversation = async (projectId: string, message: string) => {
    if (!message.trim()) return;
    setProjectChatLoading(true);
    setProjectChatInput('');

    const tempUserMsg: MessageData = { id: 'temp-user', role: 'user', content: message.trim(), createdAt: new Date().toISOString() };
    setConversationMessages([tempUserMsg]);
    setProjectsView('conversation');
    setActiveConversation({ id: 'temp', title: message.trim().substring(0, 50), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

    try {
      const res = await fetch(`/api/projects/${projectId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: message.trim(), model: selectedModel.id, solution: selectedSolution.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveConversation(data.conversation);
        setConversationMessages(data.conversation.messages || []);
        await fetchConversations(projectId);
      }
    } catch { /* ignore */ }
    finally { setProjectChatLoading(false); }
  };

  const openConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setActiveConversation(data.conversation);
        setConversationMessages(data.conversation.messages || []);
        setProjectsView('conversation');
      }
    } catch { /* ignore */ }
  };

  const sendProjectMessage = async (convId: string, content: string) => {
    if (!content.trim() || convId === 'temp') return;
    setProjectChatLoading(true);
    setProjectChatInput('');

    const tempMsg: MessageData = { id: 'temp-' + Date.now(), role: 'user', content: content.trim(), createdAt: new Date().toISOString() };
    setConversationMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: content.trim(), model: selectedModel.id, solution: selectedSolution.id }),
      });
      if (res.ok) {
        const convRes = await fetch(`/api/conversations/${convId}`, { credentials: 'include' });
        if (convRes.ok) {
          const convData = await convRes.json();
          setConversationMessages(convData.conversation.messages || []);
          setActiveConversation(convData.conversation);
        }
      }
    } catch { /* ignore */ }
    finally { setProjectChatLoading(false); }
  };

  // Load conversations when project detail opens
  useEffect(() => {
    if (projectsView === 'detail' && selectedProject) {
      fetchConversations(selectedProject.id);
    }
  }, [projectsView, selectedProject]);

  const formatRelativeDate = (dateStr: string) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  // Debounced search for projects
  useEffect(() => {
    if (!projectsOpen) return;
    const timer = setTimeout(() => fetchProjects(), projectSearch ? 300 : 0);
    return () => clearTimeout(timer);
  }, [projectSearch, projectSort, projectsOpen]);

  const openProjects = () => {
    setProjectsOpen(true);
    setSettingsOpen(false);
    setChatsPageOpen(false);
    setProjectsView('list');
    setProjectSearch('');
  };

  // Search overlay logic
  const openSearch = () => {
    setSearchOpen(true);
    setSearchQuery('');
    setSearchHighlight(0);
    setSearchLoading(true);
    Promise.all([
      fetch('/api/projects', { credentials: 'include' }).then(r => r.ok ? r.json() : { projects: [] }),
      fetch('/api/chats', { credentials: 'include' }).then(r => r.ok ? r.json() : { conversations: [] }),
    ]).then(([projData, chatData]) => {
      setSearchProjects(projData.projects || []);
      setSearchChats(chatData.conversations || []);
    }).finally(() => setSearchLoading(false));
  };

  const filteredSearchProjects = searchProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSearchChats = searchChats.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalSearchResults = filteredSearchProjects.length + filteredSearchChats.length;

  const searchRelativeDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'Past week';
    if (diffDays <= 30) return 'Past month';
    return d.toLocaleDateString();
  };

  const handleSearchSelect = (index: number) => {
    if (index < filteredSearchProjects.length) {
      const p = filteredSearchProjects[index];
      setSearchOpen(false);
      setSelectedProject(p as ProjectData);
      openProjects();
      setProjectsView('detail');
    } else {
      const c = filteredSearchChats[index - filteredSearchProjects.length];
      setSearchOpen(false);
      loadConversation(c.id);
    }
  };

  // Reset highlight when query changes
  useEffect(() => { setSearchHighlight(0); }, [searchQuery]);

  // Keyboard navigation for search
  useEffect(() => {
    if (!searchOpen) return;
    setTimeout(() => searchInputRef.current?.focus(), 50);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSearchHighlight(i => Math.min(i + 1, totalSearchResults - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSearchHighlight(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); handleSearchSelect(searchHighlight); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchOpen, searchHighlight, totalSearchResults]);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handleGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    };
    window.addEventListener('keydown', handleGlobal);
    return () => window.removeEventListener('keydown', handleGlobal);
  }, []);

  const [settingsTab, setSettingsTab] = useState('general');
  const [privacyProtectOpen, setPrivacyProtectOpen] = useState(false);
  const [privacyUseOpen, setPrivacyUseOpen] = useState(false);
  const [settingsFullName, setSettingsFullName] = useState(`${userName} ${userLastName}`);
  const [settingsCallName, setSettingsCallName] = useState(`${userName} ${userLastName}`);
  const [settingsWorkFunction, setSettingsWorkFunction] = useState('');
  const [settingsPreferences, setSettingsPreferences] = useState('');
  const [settingsNotifications, setSettingsNotifications] = useState(true);
  const [workDropdownOpen, setWorkDropdownOpen] = useState(false);
  const { colorMode, setColorMode } = useTheme();

  // Account tab state
  interface SessionData {
    id: string;
    device: string;
    location: string;
    created_at: string;
    last_active_at: string;
    is_current: boolean;
  }
  const [activeSessions, setActiveSessions] = useState<SessionData[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [orgId] = useState(() =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        })
  );

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/auth/sessions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setActiveSessions(data.sessions || []);
      }
    } catch {
      // Silently fail — user may not be authenticated via cookies
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await fetch('/api/auth/logout-all', { method: 'POST', credentials: 'include' });
      onLogout();
    } catch {
      onLogout();
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await fetch(`/api/auth/sessions/${sessionId}`, { method: 'DELETE', credentials: 'include' });
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      // ignore
    }
  };

  const formatSessionDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleCopyOrgId = async () => {
    try { await navigator.clipboard.writeText(orgId); } catch { /* ignore */ }
  };

  // Track saved values to detect dirty state
  const [savedSettings, setSavedSettings] = useState({
    fullName: `${userName} ${userLastName}`,
    callName: `${userName} ${userLastName}`,
    workFunction: '',
    preferences: '',
    notifications: true,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsToast, setSettingsToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (!settingsToast) return;
    const t = setTimeout(() => setSettingsToast(null), 3000);
    return () => clearTimeout(t);
  }, [settingsToast]);

  // Fetch work profile when settings opens
  useEffect(() => {
    if (!settingsOpen) return;
    const loadWorkProfile = async () => {
      try {
        const res = await fetch('/api/user/work', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setSettingsWorkFunction(data.data.workCategory);
            setSettingsPreferences(data.data.customInput || '');
            setSavedSettings((prev) => ({
              ...prev,
              workFunction: data.data.workCategory,
              preferences: data.data.customInput || '',
            }));
          }
        }
      } catch {
        // ignore
      }
    };
    loadWorkProfile();
  }, [settingsOpen]);

  // Fetch sessions when Account tab is selected
  useEffect(() => {
    if (settingsOpen && settingsTab === 'account') {
      fetchSessions();
    }
  }, [settingsOpen, settingsTab]);

  const settingsDirty =
    settingsFullName !== savedSettings.fullName ||
    settingsCallName !== savedSettings.callName ||
    settingsWorkFunction !== savedSettings.workFunction ||
    settingsPreferences !== savedSettings.preferences ||
    settingsNotifications !== savedSettings.notifications;

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    setSettingsToast(null);
    try {
      const res = await fetch('/api/user/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          workCategory: settingsWorkFunction,
          customInput: settingsPreferences.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedSettings({
          fullName: settingsFullName,
          callName: settingsCallName,
          workFunction: settingsWorkFunction,
          preferences: settingsPreferences,
          notifications: settingsNotifications,
        });
        setSettingsToast({ type: 'success', message: 'Settings saved successfully' });
      } else {
        setSettingsToast({ type: 'error', message: data.message || 'Failed to save settings' });
      }
    } catch {
      setSettingsToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSettingsCancel = () => {
    setSettingsFullName(savedSettings.fullName);
    setSettingsCallName(savedSettings.callName);
    setSettingsWorkFunction(savedSettings.workFunction);
    setSettingsPreferences(savedSettings.preferences);
    setSettingsNotifications(savedSettings.notifications);
    setSettingsToast(null);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const solutionDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const workDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (solutionDropdownRef.current && !solutionDropdownRef.current.contains(e.target as Node)) {
        setSolutionDropdownOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
        setLanguageMenuOpen(false);
      }
      if (workDropdownRef.current && !workDropdownRef.current.contains(e.target as Node)) {
        setWorkDropdownOpen(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setAttachMenuOpen(false);
      }
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target as Node)) {
        setChatMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string): void => {
    setInput(value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
  };

  // Fetch chat history for sidebar
  const fetchChatHistory = async () => {
    try {
      const res = await fetch('/api/chats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setChatHistoryList(data.conversations || []);
      }
    } catch { /* ignore */ }
  };

  // Load on mount
  useEffect(() => { fetchChatHistory(); }, []);

  // Load a conversation from sidebar
  const loadConversation = async (convId: string) => {
    setSettingsOpen(false);
    try {
      const res = await fetch(`/api/conversations/${convId}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      const conv = data.conversation;

      if (conv.projectId) {
        // Project conversation — open inside the Projects panel
        setProjectsOpen(true);
        // Find the project in already-loaded list or fetch it
        const proj = projects.find((p) => p.id === conv.projectId) ?? null;
        if (proj) {
          setSelectedProject(proj);
        } else {
          const pRes = await fetch(`/api/projects/${conv.projectId}`, { credentials: 'include' });
          if (pRes.ok) {
            const pData = await pRes.json();
            setSelectedProject(pData.project);
          }
        }
        setActiveConversation(conv);
        setConversationMessages(conv.messages || []);
        setProjectsView('conversation');
      } else {
        // Standalone chat — load into main chat area
        setProjectsOpen(false);
        setActiveMainConvId(conv.id);
        setMessages(mapApiMessages(conv.messages || []));
        setModelSwitchEvents([]); // Clear switch events when loading a different conversation
        if (conv.lastModelUsed) {
          setLastUsedModelId(conv.lastModelUsed);
        }
      }
    } catch { /* ignore */ }
  };

  // New chat
  // Chat context menu actions
  const renameChat = async (convId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await fetch(`/api/conversations/${convId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      await fetchChatHistory();
    } catch { /* ignore */ }
    setRenamingChatId(null);
    setRenamingTitle('');
  };

  const deleteChat = async (convId: string) => {
    try {
      await fetch(`/api/conversations/${convId}`, { method: 'DELETE', credentials: 'include' });
      if (activeMainConvId === convId) {
        setMessages([]);
        setActiveMainConvId(null);
      }
      await fetchChatHistory();
    } catch { /* ignore */ }
    setChatMenuId(null);
  };

  // Chats page
  const openChatsPage = () => {
    setChatsPageOpen(true);
    setSettingsOpen(false);
    setProjectsOpen(false);
    setChatsSearch('');
    fetchChatHistory();
  };

  const filteredChats = chatHistoryList.filter(c =>
    c.title.toLowerCase().includes(chatsSearch.toLowerCase())
  );

  // Time-based greeting with full name
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    const fullName = `${userName} ${userLastName}`.trim();
    if (hour < 12) return `Good morning, ${fullName}`;
    if (hour < 17) return `Good afternoon, ${fullName}`;
    return `Good evening, ${fullName}`;
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveMainConvId(null);
    setInput('');
    setSettingsOpen(false);
    setProjectsOpen(false);
    setChatsPageOpen(false);
    setModelSwitchEvents([]);
    setLastUsedModelId(selectedModel.id);
  };

  const mapApiMessages = (msgs: { id: string; role: string; content: string; createdAt?: string; timestamp?: string; attachments?: MessageAttachment[] }[]): Message[] =>
    msgs.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: new Date((m.createdAt || m.timestamp) ?? Date.now()),
      attachments: m.attachments || [],
    }));

  // ── SSE streaming — bypass Vite proxy (calls Node.js directly in dev) ──
  // In dev Vite buffers SSE, so we hit port 3001 directly. In prod, same origin.
  const STREAM_BASE = import.meta.env.DEV ? 'http://192.168.2.13:3001' : '';

  const readSSEStream = async (
    res: globalThis.Response,
    streamingId: string,
    onMeta?: (event: { type: string; [k: string]: any }) => void,
  ) => {
    if (!res.body) throw new Error('No response body');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(trimmed.slice(6));

          if (event.type === 'token') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingId ? { ...m, content: m.content + event.content } : m
              )
            );
          } else if (event.type === 'saved' && event.messageId) {
            setMessages((prev) =>
              prev.map((m) => (m.id === streamingId ? { ...m, id: event.messageId } : m))
            );
          } else if (event.type === 'model_switch') {
            // Model switch detected — insert a divider before the current streaming message
            setMessages((prev) => {
              const streamIdx = prev.findIndex((m) => m.id === streamingId);
              const insertAfter = streamIdx > 0 ? streamIdx - 1 : prev.length - 2;
              setModelSwitchEvents((switches) => [
                ...switches,
                {
                  previousModel: event.previousModel || 'unknown',
                  newModel: event.newModel || 'unknown',
                  summary: event.summary || '',
                  afterMessageIndex: insertAfter,
                },
              ]);
              return prev;
            });
          } else if (event.type === 'error') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingId
                  ? { ...m, content: `⚠️ ${event.content || 'Error generating response'}` }
                  : m
              )
            );
          } else {
            onMeta?.(event);
          }
        } catch { /* skip malformed JSON */ }
      }
    }
  };

  const handleSend = async (overrideContent?: string): Promise<void> => {
    const content = overrideContent ?? input.trim();
    if (!content && pendingFiles.length === 0) return;
    const msgContent = content || (pendingFiles.length > 0 ? `[Sent ${pendingFiles.length} file(s)]` : '');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msgContent,
      timestamp: new Date(),
      attachments: pendingFiles.map((f, i) => ({
        id: `pending-${i}`,
        fileName: f.name,
        mimeType: f.type,
        storagePath: '',
      })),
    };

    const streamingId = `streaming-${Date.now()}`;

    setMessages((prev) => [...prev, userMessage, {
      id: streamingId, role: 'assistant' as const, content: '', timestamp: new Date(),
    }]);
    setInput('');
    const filesToSend = [...pendingFiles];
    setPendingFiles([]);
    setIsTyping(true);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      if (filesToSend.length > 0) {
        // File uploads — non-streaming (FormData can't use SSE easily)
        const fd = new FormData();
        fd.append(!activeMainConvId ? 'message' : 'content', msgContent);
        fd.append('model', selectedModel.id);
        fd.append('solution', selectedSolution.id);
        filesToSend.forEach((f) => fd.append('files', f));

        const url = !activeMainConvId ? '/api/chats' : `/api/conversations/${activeMainConvId}/messages`;
        const res = await fetch(url, { method: 'POST', credentials: 'include', body: fd });
        if (res.ok) {
          const data = await res.json();
          if (!activeMainConvId) {
            setActiveMainConvId(data.conversation.id);
            setMessages(mapApiMessages(data.conversation.messages || []));
          } else {
            const convRes = await fetch(`/api/conversations/${activeMainConvId}`, { credentials: 'include' });
            if (convRes.ok) {
              const convData = await convRes.json();
              setMessages(mapApiMessages(convData.conversation.messages || []));
            }
          }
        }
      } else {
        // ── Streaming path — tokens appear in real time ──
        const url = !activeMainConvId
          ? `${STREAM_BASE}/api/chats/stream`
          : `${STREAM_BASE}/api/conversations/${activeMainConvId}/messages/stream`;
        const body = !activeMainConvId
          ? { message: msgContent, model: selectedModel.id, solution: selectedSolution.id }
          : { content: msgContent, model: selectedModel.id, solution: selectedSolution.id };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        await readSSEStream(res, streamingId, (event) => {
          if (event.type === 'meta' && event.conversationId) {
            setActiveMainConvId(event.conversationId);
          }
        });
      }
      setLastUsedModelId(selectedModel.id);
      await fetchChatHistory();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? { ...m, content: `⚠️ Failed to get a response from **${selectedModel.label}**. Please check your connection.` }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle paste for screenshots (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          // Create a named file from the clipboard blob
          const named = new File([file], `screenshot-${Date.now()}.png`, { type: file.type });
          imageFiles.push(named);
        }
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      setPendingFiles((prev) => [...prev, ...imageFiles]);
    }
  };

  // ---- Message Actions ----

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const handleEdit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditingContent(msg.content);
  };

  const handleEditSave = async (msgId: string) => {
    if (!editingContent.trim()) return;

    // Find the message index and remove it and all subsequent messages
    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    const updatedMessages = messages.slice(0, msgIndex);
    setMessages(updatedMessages);
    setEditingMessageId(null);
    setEditingContent('');

    // Resend with edited content
    await handleSend(editingContent.trim());
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleRetry = async (msgId: string) => {
    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    let userMsg: Message | null = null;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') { userMsg = messages[i]; break; }
    }
    if (!userMsg) return;

    const streamingId = `retry-${Date.now()}`;
    setMessages((prev) => [
      ...prev.slice(0, msgIndex),
      { id: streamingId, role: 'assistant' as const, content: '', timestamp: new Date() },
    ]);
    setIsTyping(true);

    try {
      const url = activeMainConvId
        ? `${STREAM_BASE}/api/conversations/${activeMainConvId}/messages/stream`
        : `${STREAM_BASE}/api/chats/stream`;
      const body = activeMainConvId
        ? { content: userMsg.content, model: selectedModel.id, solution: selectedSolution.id }
        : { message: userMsg.content, model: selectedModel.id, solution: selectedSolution.id };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await readSSEStream(res, streamingId, (event) => {
        if (event.type === 'meta' && event.conversationId) setActiveMainConvId(event.conversationId);
      });
      await fetchChatHistory();
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === streamingId
          ? { ...m, content: '⚠️ Failed to regenerate. Please try again.' } : m)
      );
    } finally {
      setIsTyping(false);
    }
  };

  // ---- Solution Dropdown Component ----
  const SolutionDropdown = () => (
    <div className={styles.modelDropdownWrap} ref={solutionDropdownRef}>
      <button
        className={styles.modelSelector}
        onClick={() => setSolutionDropdownOpen(!solutionDropdownOpen)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="4" cy="4" r="1.5" /><circle cx="12" cy="4" r="1.5" />
          <line x1="4" y1="9" x2="12" y2="9" /><line x1="4" y1="13" x2="12" y2="13" />
        </svg>
        <span className={styles.modelSelectorLabel}>{selectedSolution.label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>
      {solutionDropdownOpen && (
        <div className={`${styles.modelDropdown} ${styles.solutionDropdown}`}>
          <div className={styles.modelDropdownHeader}>SELECT SOLUTION</div>
          {SOLUTION_MODELS.map((model) => (
            <button
              key={model.id}
              className={`${styles.modelOption} ${selectedSolution.id === model.id ? styles.modelOptionActive : ''}`}
              onClick={() => {
                setSelectedSolution(model);
                setSolutionDropdownOpen(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="3" />
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
              </svg>
              <span>{model.label}</span>
              {selectedSolution.id === model.id && (
                <svg className={styles.checkIcon} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 7l3 3 5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ---- Model Dropdown Component ----
  const ModelDropdown = () => (
    <div className={styles.modelDropdownWrap} ref={modelDropdownRef}>
      <button
        className={styles.modelSelector}
        onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
      >
        <span className={styles.modelSelectorLabel}>{selectedModel.label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>
      {modelDropdownOpen && (
        <div className={styles.modelDropdown}>
          <div className={styles.modelDropdownHeader}>Select a model</div>
          {AI_MODELS.map((model) => (
            <button
              key={model.id}
              className={`${styles.modelOption} ${selectedModel.id === model.id ? styles.modelOptionActive : ''}`}
              onClick={() => {
                setSelectedModel(model);
                setModelDropdownOpen(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="3" />
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
              </svg>
              <span>{model.label}</span>
              {selectedModel.id === model.id && (
                <svg className={styles.checkIcon} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 7l3 3 5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const hasMessages = messages.length > 0;

  return (
    <div className={styles.screen}>
      {/* ==================== SIDEBAR ==================== */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.sidebarClosed}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLogo}>AICaffe</span>
            <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="2" width="14" height="14" rx="3" />
                <line x1="7" y1="2" x2="7" y2="16" />
              </svg>
            </button>
          </div>

          <button className={styles.newChatBtn} onClick={startNewChat}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" />
            </svg>
            {t('sidebar.newChat')}
          </button>

          <div className={styles.sidebarNav}>
            <button className={styles.navBtn} onClick={openSearch}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
              </svg>
              {t('sidebar.search')}
            </button>
          </div>

          <div className={styles.sidebarDivider} />

          <div className={styles.sidebarNav}>
            <button className={`${styles.navBtn} ${chatsPageOpen ? styles.navBtnActive : ''}`} onClick={openChatsPage}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 4c0-1.1.9-2 2-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
                <path d="M6 6h4M6 9h2" />
              </svg>
              {t('sidebar.chats')}
            </button>
            <button className={`${styles.navBtn} ${projectsOpen ? styles.navBtnActive : ''}`} onClick={openProjects}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v1H2V4zM2 5h12v7a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                <path d="M6 8h4" />
              </svg>
              {t('sidebar.projects')}
            </button>
            <button className={styles.navBtn}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="5" cy="5" r="2" /><circle cx="11" cy="5" r="2" />
                <circle cx="5" cy="11" r="2" /><circle cx="11" cy="11" r="2" />
              </svg>
              {t('sidebar.artifacts')}
            </button>
            <button className={styles.navBtn}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l4 2 4-2M4 8l4 2 4-2M4 12l4 2 4-2" />
              </svg>
              {t('sidebar.code')}
            </button>
          </div>

          <div className={styles.sidebarSection}>
            <span className={styles.sectionLabel}>{t('sidebar.recents')}</span>
            {chatHistoryList.length === 0 ? null : (() => {
              const now = new Date();
              const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
              const startOf7Days = new Date(startOfToday.getTime() - 6 * 86400000);
              const startOf30Days = new Date(startOfToday.getTime() - 29 * 86400000);

              const groups: { label: string; chats: typeof chatHistoryList }[] = [
                { label: 'Today', chats: chatHistoryList.filter(c => new Date(c.updatedAt) >= startOfToday) },
                { label: 'Yesterday', chats: chatHistoryList.filter(c => new Date(c.updatedAt) >= startOfYesterday && new Date(c.updatedAt) < startOfToday) },
                { label: 'Previous 7 Days', chats: chatHistoryList.filter(c => new Date(c.updatedAt) >= startOf7Days && new Date(c.updatedAt) < startOfYesterday) },
                { label: 'Previous 30 Days', chats: chatHistoryList.filter(c => new Date(c.updatedAt) >= startOf30Days && new Date(c.updatedAt) < startOf7Days) },
                { label: 'Older', chats: chatHistoryList.filter(c => new Date(c.updatedAt) < startOf30Days) },
              ];

              return groups.filter(g => g.chats.length > 0).map(group => (
                <div key={group.label}>
                  <div className={styles.recentsGroupLabel}>{group.label}</div>
                  {group.chats.map((chat) => (
                    <div key={chat.id} className={styles.chatItemWrap}>
                      {renamingChatId === chat.id ? (
                        /* Inline rename input */
                        <div className={styles.chatItemRename}>
                          <input
                            className={styles.chatItemRenameInput}
                            value={renamingTitle}
                            onChange={(e) => setRenamingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') renameChat(chat.id, renamingTitle);
                              if (e.key === 'Escape') { setRenamingChatId(null); setRenamingTitle(''); }
                            }}
                            onBlur={() => renameChat(chat.id, renamingTitle)}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <button
                          className={`${styles.chatItem} ${activeMainConvId === chat.id ? styles.chatItemActive : ''}`}
                          onClick={() => loadConversation(chat.id)}
                          title={chat.projectName ? `${chat.projectName}` : undefined}
                        >
                          <span className={styles.chatItemTitle}>{chat.title}</span>
                          {/* 3-dot menu trigger */}
                          <span
                            className={styles.chatItemMenuBtn}
                            onClick={(e) => { e.stopPropagation(); setChatMenuId(chatMenuId === chat.id ? null : chat.id); }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                              <circle cx="3" cy="7" r="1.2" /><circle cx="7" cy="7" r="1.2" /><circle cx="11" cy="7" r="1.2" />
                            </svg>
                          </span>
                        </button>
                      )}

                      {/* Context menu */}
                      {chatMenuId === chat.id && (
                        <div className={styles.chatContextMenu} ref={chatMenuRef}>
                          <button className={styles.chatContextItem} onClick={() => setChatMenuId(null)}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M7 2l1.5 3L12 5.5 9.5 8l.7 3.5L7 10l-3.2 1.5.7-3.5L2 5.5 5.5 5 7 2z" />
                            </svg>
                            Star
                          </button>
                          <button className={styles.chatContextItem} onClick={() => {
                            setChatMenuId(null);
                            setRenamingChatId(chat.id);
                            setRenamingTitle(chat.title);
                          }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M8.5 2.5l3 3L4 13H1v-3L8.5 2.5z" />
                            </svg>
                            Rename
                          </button>
                          <button className={styles.chatContextItem} onClick={() => setChatMenuId(null)}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M1 3.5a2 2 0 012-2h8a2 2 0 012 2v.5H1v-.5zM1 4h12v7a2 2 0 01-2 2H3a2 2 0 01-2-2V4z" />
                            </svg>
                            Add to project
                          </button>
                          <div className={styles.chatContextDivider} />
                          <button className={`${styles.chatContextItem} ${styles.chatContextItemDanger}`} onClick={() => deleteChat(chat.id)}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M11 4v7.5a1 1 0 01-1 1H4a1 1 0 01-1-1V4" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ));
            })()}
          </div>

        </div>

        {/* User profile at bottom */}
        <div className={styles.sidebarProfileWrap} ref={profileMenuRef}>
          {/* Profile popup menu */}
          {profileMenuOpen && (
            <div className={styles.profileMenu}>
              <div className={styles.profileMenuEmail}>{userEmail}</div>
              <div className={styles.profileMenuDivider} />
              <button className={styles.profileMenuItem} onClick={() => { setSettingsOpen(true); setProjectsOpen(false); setChatsPageOpen(false); setProfileMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="3" />
                  <path d="M13.4 10.2a1.06 1.06 0 00.21 1.17l.04.04a1.29 1.29 0 11-1.82 1.82l-.04-.04a1.06 1.06 0 00-1.17-.21 1.06 1.06 0 00-.65.98v.1a1.29 1.29 0 11-2.58 0v-.06a1.06 1.06 0 00-.7-.97 1.06 1.06 0 00-1.17.21l-.04.04a1.29 1.29 0 11-1.82-1.82l.04-.04a1.06 1.06 0 00.21-1.17 1.06 1.06 0 00-.98-.65h-.1a1.29 1.29 0 110-2.58h.06a1.06 1.06 0 00.97-.7 1.06 1.06 0 00-.21-1.17l-.04-.04A1.29 1.29 0 114.4 3.24l.04.04a1.06 1.06 0 001.17.21h.05a1.06 1.06 0 00.64-.97v-.1a1.29 1.29 0 012.58 0v.06a1.06 1.06 0 00.65.97 1.06 1.06 0 001.17-.21l.04-.04a1.29 1.29 0 011.82 1.82l-.04.04a1.06 1.06 0 00-.21 1.17v.05a1.06 1.06 0 00.97.64h.1a1.29 1.29 0 010 2.58h-.06a1.06 1.06 0 00-.97.65z" />
                </svg>
                {t('menu.settings')}
                <span className={styles.menuShortcut}>Ctrl+,</span>
              </button>
              <div className={styles.languageMenuWrap}>
                <button className={styles.profileMenuItem} onClick={() => setLanguageMenuOpen(!languageMenuOpen)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="8" cy="8" r="7" />
                    <path d="M8 5v3l2 1" />
                  </svg>
                  {t('menu.language')}
                  <svg className={styles.menuChevron} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d={languageMenuOpen ? 'M3 7.5l3-3 3 3' : 'M4.5 3l3 3-3 3'} />
                  </svg>
                </button>
                {languageMenuOpen && (
                  <div className={styles.languageSubmenu}>
                    <button
                      className={`${styles.languageOption} ${selectedLanguage === 'en' ? styles.languageOptionActive : ''}`}
                      onClick={() => { setSelectedLanguage('en'); setLanguageMenuOpen(false); }}
                    >
                      {t('menu.langEnglish')}
                      {selectedLanguage === 'en' && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 7l3 3 5-5" />
                        </svg>
                      )}
                    </button>
                    <button
                      className={`${styles.languageOption} ${selectedLanguage === 'hi' ? styles.languageOptionActive : ''}`}
                      onClick={() => { setSelectedLanguage('hi'); setLanguageMenuOpen(false); }}
                    >
                      {t('menu.langHindi')}
                      {selectedLanguage === 'hi' && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 7l3 3 5-5" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.profileMenuDivider} />
              <button className={styles.profileMenuItem}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="7" />
                  <path d="M6 6.5a2 2 0 013.5 1.5c0 1-1.5 1.5-1.5 1.5M8 11.5h.01" />
                </svg>
                {t('menu.getHelp')}
              </button>
              <div className={styles.profileMenuDivider} />
              <button className={styles.profileMenuItem} onClick={() => { setUpgradeOpen(true); setProfileMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="7" />
                  <path d="M8 5v6M5.5 8l2.5-3 2.5 3" />
                </svg>
                {t('menu.upgradePlan')}
              </button>
              <div className={styles.profileMenuDividerRed} />
              <button className={`${styles.profileMenuItem} ${styles.profileMenuItemLogout}`} onClick={onLogout}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" />
                </svg>
                {t('menu.logout')}
              </button>
            </div>
          )}

          <div className={styles.sidebarProfile} onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
            <div className={styles.profileAvatar}>{userName.charAt(0).toUpperCase()}</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{userName}</span>
              <span className={styles.profilePlan}>{t('sidebar.freePlan')}</span>
            </div>
            <button className={styles.logoutBtn} title="Menu">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CHAT AREA ==================== */}
      <main className={styles.main}>
        {!settingsOpen && !projectsOpen && !chatsPageOpen && <>
        {/* Top bar */}
        <div className={styles.topBar}>
          {!sidebarOpen && (
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
          )}
          <div className={styles.topBarSpacer} />
          <button className={styles.profileIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="10" cy="7" r="4" /><path d="M3 18c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6" />
            </svg>
          </button>
        </div>

        {/* Chat content */}
        <div className={styles.chatArea}>
          {!hasMessages ? (
            /* ---- Empty state / Welcome ---- */
            <div className={styles.welcome}>
              <div className={styles.welcomeBg} />
              <div className={styles.welcomeIcon}>
                <img src={logo} alt="" className={styles.welcomeLogo} />
                <div className={styles.logoTooltip}>Hi, I'm AICaffe. How can I help you today?</div>
              </div>
              <h1 className={styles.welcomeTitle}>
                <img src={logo} alt="AICaffe" className={styles.welcomeTitleLogo} /> {getGreeting()}
              </h1>

              {/* Input box (centered) */}
              <div className={styles.inputBoxWelcome}>
                {/* File previews */}
                {pendingFiles.length > 0 && (
                  <div className={styles.filePreviews}>
                    {pendingFiles.map((file, idx) => (
                      <div key={idx} className={styles.fileChip}>
                        {file.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} alt={file.name} className={styles.fileThumb} />
                        ) : (
                          <span className={styles.fileIcon}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M12 2v4h4" />
                            </svg>
                          </span>
                        )}
                        <span className={styles.fileName}>{file.name}</span>
                        <button className={styles.fileRemoveBtn} onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M2 2l8 8M10 2l-8 8" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  className={styles.textarea}
                  placeholder={t('welcome.placeholder')}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  rows={1}
                />
                <div className={styles.inputActions}>
                  <div className={styles.inputLeft}>
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.json,.png,.jpg,.jpeg,.gif,.webp,.zip,.doc,.pptx,.md"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files) setPendingFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                        e.target.value = '';
                      }}
                    />
                    <div className={styles.attachMenuWrap} ref={attachMenuRef}>
                      <button className={styles.attachBtn} onClick={() => setAttachMenuOpen(!attachMenuOpen)}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <line x1="11" y1="5" x2="11" y2="17" /><line x1="5" y1="11" x2="17" y2="11" />
                        </svg>
                      </button>
                      {attachMenuOpen && (
                        <div className={styles.attachMenu}>
                          <button className={styles.attachMenuItem} onClick={() => { setAttachMenuOpen(false); fileInputRef.current?.click(); }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M14 8.87V13a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h4.13" />
                              <path d="M8 2h6v6M14 2L7 9" />
                            </svg>
                            Add files or photos
                          </button>
                        </div>
                      )}
                    </div>
                    <SolutionDropdown />
                  </div>
                  <div className={styles.inputRight}>
                    <ModelDropdown />
                    <button className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`} title={isListening ? 'Stop listening' : 'Voice Input'} onClick={toggleVoiceInput}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="22"></line>
                      </svg>
                    </button>
                    <button
                      className={`${styles.sendBtn} ${isTyping ? styles.sendBtnLoading : input.trim() ? styles.sendBtnActive : ''}`}
                      onClick={() => handleSend()}
                      disabled={!input.trim() && !isTyping}
                    >
                      {isTyping ? (
                        <svg className={styles.spinner} width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="10" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Solution indicator pill + disclaimer */}
              <div className={styles.solutionIndicator} onClick={() => setSolutionDropdownOpen(!solutionDropdownOpen)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="3" fill="#d97706" />
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" />
                </svg>
                <span>{selectedSolution.label}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </div>
              <p className={styles.disclaimer}>AICaffe is AI and can make mistakes.</p>

              {/* Quick actions */}
              <div className={styles.quickActions}>
                {QUICK_ACTIONS.filter((a) =>
                  topics.includes(a.id)
                ).slice(0, 5).map((action) => (
                  <button
                    key={action.id}
                    className={styles.quickBtn}
                    onClick={() => {
                      handleInputChange(`Help me with ${action.label.toLowerCase()}`);
                      inputRef.current?.focus();
                    }}
                  >
                    <span>{action.icon}</span> {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ---- Messages ---- */
            <div className={styles.messages}>
              {messages.map((msg, idx) => (
                <React.Fragment key={msg.id}>
                  {/* Model Switch Divider */}
                  {modelSwitchEvents.some((e) => e.afterMessageIndex === idx - 1) && (() => {
                    const switchEvt = modelSwitchEvents.find((e) => e.afterMessageIndex === idx - 1)!;
                    const prevLabel = AI_MODELS.find((m) => m.id === switchEvt.previousModel)?.label || switchEvt.previousModel;
                    const newLabel = AI_MODELS.find((m) => m.id === switchEvt.newModel)?.label || switchEvt.newModel;
                    return (
                      <div className={styles.modelSwitchDivider}>
                        <div className={styles.modelSwitchLine} />
                        <div className={styles.modelSwitchBadge}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M1 7h12M9 3l4 4-4 4" />
                          </svg>
                          <span>Switched from <strong>{prevLabel}</strong> to <strong>{newLabel}</strong></span>
                        </div>
                        {/* Summary is stored in DB and passed as context to the new model — not shown to user */}
                        <div className={styles.modelSwitchLine} />
                      </div>
                    );
                  })()}
                <div className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgUser : styles.msgAssistant}`}>
                  {msg.role === 'assistant' && (
                    <div className={styles.msgAvatar}>
                      <img src={logo} alt="" className={`${styles.avatarImg} ${isTyping && idx === messages.length - 1 ? styles.avatarGlow : ''}`} />
                    </div>
                  )}
                  <div className={styles.msgContent}>
                    {editingMessageId === msg.id ? (
                      /* Editing state */
                      <div className={styles.editWrap}>
                        <textarea
                          className={styles.editTextarea}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={3}
                          autoFocus
                        />
                        <div className={styles.editActions}>
                          <button className={styles.editCancelBtn} onClick={handleEditCancel}>Cancel</button>
                          <button className={styles.editSaveBtn} onClick={() => handleEditSave(msg.id)}>Send</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`${styles.msgBubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={styles.msgAttachments}>
                              {msg.attachments.map((att) => (
                                <a
                                  key={att.id}
                                  className={styles.msgAttachChip}
                                  href={att.storagePath ? `/uploads/${att.storagePath}` : '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {att.mimeType.startsWith('image/') && att.storagePath ? (
                                    <img src={`/uploads/${att.storagePath}`} alt={att.fileName} className={styles.msgAttachThumb} />
                                  ) : (
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                      <path d="M3 1h7l3 3v10a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" /><path d="M10 1v3h3" />
                                    </svg>
                                  )}
                                  <span>{att.fileName}</span>
                                </a>
                              ))}
                            </div>
                          )}
                          {msg.content.split('\n').map((line, i) => (
                            <p key={i} className={styles.msgLine}>
                              {line.split('**').map((part, j) =>
                                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                              )}
                            </p>
                          ))}
                        </div>
                        {/* Message action bar — visible on hover */}
                        <div className={`${styles.msgActions} ${msg.role === 'user' ? styles.msgActionsUser : ''}`}>
                          {/* Date */}
                          <span className={styles.msgDate}>
                            {msg.timestamp.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </span>

                          {/* Retry — assistant only */}
                          {msg.role === 'assistant' && (
                            <button className={styles.msgActionBtn} onClick={() => handleRetry(msg.id)} data-tooltip="Retry">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M1 7a6 6 0 0111.2-3M13 7a6 6 0 01-11.2 3" />
                                <path d="M12.2 1v3h-3M1.8 13v-3h3" />
                              </svg>
                            </button>
                          )}

                          {/* Edit — user only */}
                          {msg.role === 'user' && (
                            <button className={styles.msgActionBtn} onClick={() => handleEdit(msg)} data-tooltip="Edit">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M8.5 2.5l3 3L4 13H1v-3L8.5 2.5z" />
                              </svg>
                            </button>
                          )}

                          {/* Copy */}
                          <button className={styles.msgActionBtn} onClick={() => handleCopy(msg.content)} data-tooltip="Copy">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <rect x="4" y="4" width="8" height="8" rx="1.5" />
                              <path d="M4 10H3a1.5 1.5 0 01-1.5-1.5v-6A1.5 1.5 0 013 1h6A1.5 1.5 0 0110.5 2.5V4" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                </React.Fragment>
              ))}

              {isTyping && !messages.some((m) => m.role === 'assistant' && m.content === '') && (
                <div className={`${styles.msgRow} ${styles.msgAssistant}`}>
                  <div className={styles.msgAvatar}>
                    <img src={logo} alt="" className={`${styles.avatarImg} ${styles.avatarGlow}`} />
                  </div>
                  <div className={styles.typingDots}>
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom input (when messages exist) */}
        {hasMessages && (
          <div className={styles.bottomInput}>
            <div className={styles.inputBoxBottom}>
              {/* Pasted file previews */}
              {pendingFiles.length > 0 && (
                <div className={styles.pastedPreviews}>
                  {pendingFiles.map((file, idx) => (
                    <div key={idx} className={styles.pastedCard}>
                      <button className={styles.pastedRemove} onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 3l8 8M11 3l-8 8" />
                        </svg>
                      </button>
                      {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className={styles.pastedImage} />
                      ) : (
                        <div className={styles.pastedFile}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M5 3h10l4 4v14a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" /><path d="M15 3v4h4" />
                          </svg>
                          <span>{file.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <textarea
                ref={inputRef}
                className={styles.textarea}
                placeholder="Reply to AICaffe..."
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                rows={1}
              />
              <div className={styles.inputActions}>
                <div className={styles.inputLeft}>
                  <button className={styles.attachBtn}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="11" y1="5" x2="11" y2="17" /><line x1="5" y1="11" x2="17" y2="11" />
                    </svg>
                  </button>
                  <SolutionDropdown />
                </div>
                <div className={styles.inputRight}>
                  <ModelDropdown />
                  <button className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`} title={isListening ? 'Stop listening' : 'Voice Input'} onClick={toggleVoiceInput}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="22"></line>
                    </svg>
                  </button>
                  <button
                    className={`${styles.sendBtn} ${input.trim() ? styles.sendBtnActive : ''}`}
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {/* Solution indicator pill + disclaimer */}
            <div className={styles.bottomIndicatorRow}>
              <div className={styles.solutionIndicator} onClick={() => setSolutionDropdownOpen(!solutionDropdownOpen)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="3" fill="#d97706" />
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" />
                </svg>
                <span>{selectedSolution.label}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </div>
              <p className={styles.disclaimer}>AICaffe is AI and can make mistakes.</p>
            </div>
          </div>
        )}

        </>}

        {/* ==================== SETTINGS (inline in main) ==================== */}
        {settingsOpen && (
          <div className={styles.settingsInline}>
            {/* Top row: hamburger + close */}
            <div className={styles.settingsTopBar}>
              {!sidebarOpen && (
                <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 5h14M3 10h14M3 15h14" />
                  </svg>
                </button>
              )}
              <div className={styles.topBarSpacer} />
              <button className={styles.settingsClose} onClick={() => setSettingsOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            <h1 className={styles.settingsTitle}>Settings</h1>

            <div className={styles.settingsLayout}>
              {/* Settings sidebar */}
              <nav className={styles.settingsSidebar}>
                {['General', 'Account', 'Privacy', 'Billing'].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.settingsNavBtn} ${settingsTab === tab.toLowerCase() ? styles.settingsNavBtnActive : ''}`}
                    onClick={() => setSettingsTab(tab.toLowerCase())}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              {/* Settings content */}
              <div className={styles.settingsContent}>
                {settingsTab === 'general' && (
                  <>
                    {/* Profile Section */}
                    <section className={styles.settingsSection}>
                      <h2 className={styles.settingsSectionTitle}>Profile</h2>
                      <div className={styles.settingsProfileRow}>
                        <div className={styles.settingsFieldGroup}>
                          <label className={styles.settingsLabel}>Full name</label>
                          <div className={styles.settingsNameInput}>
                            <div className={styles.settingsNameAvatar}>
                              {settingsFullName.charAt(0).toUpperCase()}
                            </div>
                            <input
                              type="text"
                              className={styles.settingsInput}
                              value={settingsFullName}
                              onChange={(e) => setSettingsFullName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className={styles.settingsFieldGroup}>
                          <label className={styles.settingsLabel}>What should AICaffe call you?</label>
                          <input
                            type="text"
                            className={styles.settingsInput}
                            value={settingsCallName}
                            onChange={(e) => setSettingsCallName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles.settingsFieldGroup}>
                        <label className={styles.settingsLabel}>What best describes your work?</label>
                        <div className={styles.settingsSelectWrap} ref={workDropdownRef}>
                          <button
                            className={styles.settingsSelectBtn}
                            onClick={() => setWorkDropdownOpen(!workDropdownOpen)}
                            type="button"
                          >
                            <span className={settingsWorkFunction ? '' : styles.settingsSelectPlaceholder}>
                              {settingsWorkFunction
                                ? { esg: 'ESG', election: 'Election Caffe', workforce: 'Workforce Intelligence', datacaffe: 'DataCaffe', insurance: 'Insurance' }[settingsWorkFunction]
                                : 'Select your work function'}
                            </span>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M4 5.5l3 3 3-3" />
                            </svg>
                          </button>
                          {workDropdownOpen && (
                            <div className={styles.settingsDropdownList}>
                              {[
                                { value: 'esg', label: 'ESG' },
                                { value: 'election', label: 'Election Caffe' },
                                { value: 'workforce', label: 'Workforce Intelligence' },
                                { value: 'datacaffe', label: 'DataCaffe' },
                                { value: 'insurance', label: 'Insurance' },
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  className={`${styles.settingsDropdownItem} ${settingsWorkFunction === opt.value ? styles.settingsDropdownItemActive : ''}`}
                                  onClick={() => { setSettingsWorkFunction(opt.value); setWorkDropdownOpen(false); }}
                                >
                                  {opt.label}
                                  {settingsWorkFunction === opt.value && (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={styles.checkIcon}>
                                      <path d="M3 7l3 3 5-5" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles.settingsFieldGroup}>
                        <label className={styles.settingsLabel}>
                          What <u>personal preferences</u> should AICaffe consider in responses?
                        </label>
                        <p className={styles.settingsHint}>
                          Your preferences will apply to all conversations, within AICaffe's guidelines.
                        </p>
                        <textarea
                          className={styles.settingsTextarea}
                          placeholder="e.g. when learning new concepts, I find analogies particularly helpful"
                          value={settingsPreferences}
                          onChange={(e) => setSettingsPreferences(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </section>

                    <div className={styles.settingsDivider} />

                    {/* Notifications Section */}
                    <section className={styles.settingsSection}>
                      <h2 className={styles.settingsSectionTitle}>Notifications</h2>
                      <div className={styles.settingsToggleRow}>
                        <div>
                          <div className={styles.settingsToggleLabel}>Response completions</div>
                          <p className={styles.settingsToggleDesc}>
                            Get notified when AICaffe has finished a response. Most useful for long-running tasks like tool calls and Research.
                          </p>
                        </div>
                        <button
                          className={`${styles.settingsToggle} ${settingsNotifications ? styles.settingsToggleOn : ''}`}
                          onClick={() => setSettingsNotifications(!settingsNotifications)}
                        >
                          <span className={styles.settingsToggleKnob} />
                        </button>
                      </div>
                    </section>

                    <div className={styles.settingsDivider} />

                    {/* Appearance Section */}
                    <section className={styles.settingsSection}>
                      <h2 className={styles.settingsSectionTitle}>Appearance</h2>
                      <label className={styles.settingsLabel}>Color mode</label>
                      <div className={styles.colorModes}>
                        {(['light', 'auto', 'dark'] as const).map((mode) => (
                          <button
                            key={mode}
                            className={`${styles.settingsColorCard} ${colorMode === mode ? styles.settingsColorCardActive : ''}`}
                            onClick={() => setColorMode(mode)}
                          >
                            <div className={`${styles.settingsColorPreview} ${styles[`colorPreview_${mode}`]}`}>
                              <div className={styles.colorPreviewLines}>
                                <span /><span /><span />
                              </div>
                              <div className={styles.colorPreviewInput}>
                                <span className={styles.colorPreviewDot} />
                              </div>
                            </div>
                            <span className={styles.settingsColorLabel}>
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  </>
                )}

                {settingsTab === 'account' && (
                  <>
                    <section className={styles.settingsSection}>
                      <h2 className={styles.settingsSectionTitle}>Account</h2>

                      {/* Log out of all devices */}
                      <div className={styles.accountRow}>
                        <span className={styles.accountRowLabel}>Log out of all devices</span>
                        <button className={styles.accountOutlineBtn} onClick={handleLogoutAll}>Log out</button>
                      </div>

                      <div className={styles.settingsDivider} />

                      {/* Delete account */}
                      <div className={styles.accountRow}>
                        <span className={styles.accountRowLabel}>Delete account</span>
                        <button className={styles.accountFilledBtn}>Contact support</button>
                      </div>

                      <div className={styles.settingsDivider} />

                      {/* Organization ID */}
                      <div className={styles.accountRow}>
                        <span className={styles.accountRowLabel}>Organization ID</span>
                        <div className={styles.orgIdWrap}>
                          <code className={styles.orgIdCode}>{orgId}</code>
                          <button className={styles.orgIdCopyBtn} onClick={handleCopyOrgId} title="Copy">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <rect x="4" y="4" width="8" height="8" rx="1.5" />
                              <path d="M4 10H3a1.5 1.5 0 01-1.5-1.5v-6A1.5 1.5 0 013 1h6A1.5 1.5 0 0110.5 2.5V4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </section>

                    <div className={styles.settingsDivider} />

                    {/* Active Sessions */}
                    <section className={styles.settingsSection}>
                      <h2 className={styles.settingsSectionTitle}>Active sessions</h2>

                      {sessionsLoading ? (
                        <p className={styles.settingsHint}>Loading sessions...</p>
                      ) : activeSessions.length === 0 ? (
                        <p className={styles.settingsHint}>No active sessions found.</p>
                      ) : (
                        <div className={styles.sessionsTable}>
                          <div className={styles.sessionsHeader}>
                            <span>Device</span>
                            <span>Location</span>
                            <span>Created</span>
                            <span>Updated</span>
                            <span />
                          </div>
                          {activeSessions.map((session) => (
                            <div key={session.id} className={styles.sessionsRow}>
                              <span className={styles.sessionDevice}>
                                {session.device}
                                {session.is_current && <span className={styles.sessionCurrentBadge}>Current</span>}
                              </span>
                              <span className={styles.sessionLocation}>{session.location || 'Unknown'}</span>
                              <span className={styles.sessionDate}>{formatSessionDate(session.created_at)}</span>
                              <span className={styles.sessionDate}>{formatSessionDate(session.last_active_at)}</span>
                              <button
                                className={styles.sessionMenuBtn}
                                onClick={() => handleRevokeSession(session.id)}
                                title="Revoke session"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <circle cx="8" cy="3" r="1.5" />
                                  <circle cx="8" cy="8" r="1.5" />
                                  <circle cx="8" cy="13" r="1.5" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                )}

                {settingsTab === 'privacy' && (
                  <>
                    <section className={styles.settingsSection}>
                      {/* Privacy header */}
                      <div className={styles.privacyHeader}>
                        <div className={styles.privacyIconWrap}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M12 2l7 4v6c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className={styles.privacyTitle}>Privacy</h2>
                          <p className={styles.privacySubtitle}>AICaffe believes in transparent data practices</p>
                        </div>
                      </div>

                      <p className={styles.privacyDesc}>
                        Learn how your information is protected when using AICaffe products, and visit our{' '}
                        <a href="#" className={styles.privacyLink}>Privacy Center</a> and{' '}
                        <a href="#" className={styles.privacyLink}>Privacy Policy</a> for more details.
                      </p>

                      <button className={styles.privacyTextBtn} onClick={() => setPrivacyProtectOpen(!privacyProtectOpen)}>
                        How we protect your data
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: privacyProtectOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                          <path d="M5 3l4 4-4 4" />
                        </svg>
                      </button>
                      {privacyProtectOpen && (
                        <ul className={styles.privacyList}>
                          <li>You have control over your conversation data and can change your preferences any time in your <a href="#" className={styles.privacyLink}>Privacy Settings</a>.</li>
                          <li>DataCaffe deletes your data promptly when requested, except for safety violations or conversations you've shared through feedback.</li>
                          <li>DataCaffe doesn't sell your data to third parties.</li>
                        </ul>
                      )}

                      <button className={styles.privacyTextBtn} onClick={() => setPrivacyUseOpen(!privacyUseOpen)}>
                        How we use your data
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: privacyUseOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                          <path d="M5 3l4 4-4 4" />
                        </svg>
                      </button>
                      {privacyUseOpen && (
                        <ul className={styles.privacyList}>
                          <li>With your permission, we will use your chats and coding sessions to train and improve our AI models. This helps us to 1) improve our AI models to make AICaffe more helpful and accurate for everyone and 2) develop more robust safeguards against harmful outputs.</li>
                          <li>DataCaffe may use your email for account verification, billing, and DataCaffe-led communications and marketing (e.g., emails sharing new product offerings and features).</li>
                          <li>DataCaffe may conduct aggregated, anonymized analysis of data to understand how people use AICaffe.</li>
                          <li>DataCaffe may offer additional features, which will enable us to collect and use more of your data. You'll always be in control and can turn off these features in your account settings.</li>
                        </ul>
                      )}
                    </section>

                    <div className={styles.settingsDivider} />

                    {/* Privacy settings */}
                    <section className={styles.settingsSection}>
                      <h2 className={styles.settingsSectionTitle}>Privacy settings</h2>

                      <div className={styles.accountRow}>
                        <span className={styles.accountRowLabel}>Export data</span>
                        <button className={styles.accountOutlineBtn}>Export data</button>
                      </div>

                      <div className={styles.settingsDivider} />

                      <div className={styles.accountRow}>
                        <span className={styles.accountRowLabel}>Shared chats</span>
                        <button className={styles.accountOutlineBtn}>Manage</button>
                      </div>

                    </section>
                  </>
                )}

                {settingsTab === 'billing' && (
                  <section className={styles.settingsSection}>
                    <h2 className={styles.settingsSectionTitle}>Billing</h2>
                    <p className={styles.settingsHint}>You are currently on the <strong>Free plan</strong>.</p>
                  </section>
                )}

              </div>
            </div>

            {/* Toast notification */}
            {settingsToast && (
              <div className={`${styles.settingsToast} ${settingsToast.type === 'error' ? styles.settingsToastError : styles.settingsToastSuccess}`}>
                {settingsToast.type === 'success' ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8l3 3 7-7" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="6" /><path d="M8 5v3M8 10.5h.01" /></svg>
                )}
                {settingsToast.message}
              </div>
            )}

            {/* Cancel / Save Changes buttons */}
            {settingsDirty && (
              <div className={styles.settingsFooter}>
                <button className={styles.settingsCancelBtn} onClick={handleSettingsCancel} disabled={settingsSaving}>Cancel</button>
                <button className={styles.settingsSaveBtn} onClick={handleSettingsSave} disabled={settingsSaving}>
                  {settingsSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== PROJECTS (inline in main) ==================== */}
        {projectsOpen && (
          <div className={styles.projectsInline}>
            {/* Top bar */}
            <div className={styles.settingsTopBar}>
              {!sidebarOpen && (
                <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 5h14M3 10h14M3 15h14" />
                  </svg>
                </button>
              )}
              <div className={styles.topBarSpacer} />
              <button className={styles.settingsClose} onClick={() => setProjectsOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            {/* ==== List View ==== */}
            {projectsView === 'list' && (
              <div className={styles.projectsContent}>
                <div className={styles.projectsHeader}>
                  <h1 className={styles.projectsTitle}>Projects</h1>
                  <button className={styles.projectNewBtn} onClick={() => { setProjectForm({ name: '', description: '' }); setProjectsView('create'); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" />
                    </svg>
                    New project
                  </button>
                </div>

                {/* Search bar */}
                <div className={styles.projectsToolbar}>
                  <div className={styles.projectsSearchWrap}>
                    <svg className={styles.projectsSearchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
                    </svg>
                    <input
                      className={styles.projectsSearch}
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sort row */}
                <div className={styles.projectsSortRow}>
                  <div className={styles.topBarSpacer} />
                  <div className={styles.projectsSortWrap}>
                    <span className={styles.projectsSortLabel}>Sort by</span>
                    <button className={styles.projectsSortBtn} onClick={() => setProjectSortOpen(!projectSortOpen)}>
                      {projectSort === 'activity' ? 'Activity' : 'Created'}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 5l3 3 3-3" />
                      </svg>
                    </button>
                    {projectSortOpen && (
                      <div className={styles.projectsSortDropdown}>
                        <button className={projectSort === 'activity' ? styles.projectsSortItemActive : ''} onClick={() => { setProjectSort('activity'); setProjectSortOpen(false); }}>Activity</button>
                        <button className={projectSort === 'created' ? styles.projectsSortItemActive : ''} onClick={() => { setProjectSort('created'); setProjectSortOpen(false); }}>Created</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid */}
                {projectsLoading ? (
                  <div className={styles.projectsEmpty}>Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className={styles.projectsEmpty}>
                    {projectSearch ? 'No projects match your search.' : 'No projects yet. Create your first project!'}
                  </div>
                ) : (
                  <div className={styles.projectsGrid}>
                    {projects.map((p) => (
                      <div key={p.id} className={styles.projectCard} onClick={() => { setSelectedProject(p); setProjectsView('detail'); }}>
                        <div className={styles.projectCardName}>{p.name}</div>
                        <div className={styles.projectCardMeta}>Updated {formatRelativeDate(p.updatedAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==== Create View ==== */}
            {projectsView === 'create' && (
              <div className={styles.projectsContent}>
                <div className={styles.projectsHeader}>
                  <button className={styles.projectBackBtn} onClick={() => setProjectsView('list')}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M14 9H4M4 9l5-5M4 9l5 5" />
                    </svg>
                    Back
                  </button>
                </div>
                <div className={styles.projectFormWrap}>
                  <h2 className={styles.settingsSectionTitle}>Create new project</h2>
                  <div className={styles.settingsFieldGroup}>
                    <label className={styles.settingsLabel}>Project name</label>
                    <input
                      type="text"
                      className={styles.settingsInput}
                      placeholder="My project"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      autoFocus
                      maxLength={100}
                    />
                  </div>
                  <div className={styles.settingsFieldGroup}>
                    <label className={styles.settingsLabel}>Description (optional)</label>
                    <textarea
                      className={styles.settingsTextarea}
                      placeholder="What is this project about?"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className={styles.projectFormActions}>
                    <button className={styles.settingsCancelBtn} onClick={() => setProjectsView('list')}>Cancel</button>
                    <button className={styles.settingsSaveBtn} onClick={createProject} disabled={!projectForm.name.trim() || projectSaving}>
                      {projectSaving ? 'Creating...' : 'Create project'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==== Detail View (Project Workspace) ==== */}
            {projectsView === 'detail' && selectedProject && (
              <div className={styles.projectsContent}>
                {/* Back link */}
                <button className={styles.projectBackLink} onClick={() => setProjectsView('list')}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 8H4M4 8l4-4M4 8l4 4" />
                  </svg>
                  All projects
                </button>

                {/* Project header */}
                <div className={styles.projectWorkspaceHeader}>
                  <h1 className={styles.projectWorkspaceName}>{selectedProject.name}</h1>
                  <div className={styles.projectWorkspaceActions}>
                    <button className={styles.projectIconBtn} onClick={() => {
                      setProjectForm({ name: selectedProject.name, description: selectedProject.description || '' });
                      setProjectsView('edit');
                    }} title="More options">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <circle cx="4" cy="9" r="1.5" /><circle cx="9" cy="9" r="1.5" /><circle cx="14" cy="9" r="1.5" />
                      </svg>
                    </button>
                    <button className={styles.projectIconBtn} title="Star">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 2l2.1 4.3L16 7l-3.5 3.4.8 4.8L9 13l-4.3 2.2.8-4.8L2 7l4.9-.7L9 2z" />
                      </svg>
                    </button>
                    <button className={styles.accountOutlineBtn}>Share</button>
                  </div>
                </div>

                {/* Chat input */}
                <div className={styles.projectChatInput}>
                  <textarea
                    className={styles.textarea}
                    placeholder="How can I help you today?"
                    value={projectChatInput}
                    onChange={(e) => setProjectChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && selectedProject) {
                        e.preventDefault();
                        startConversation(selectedProject.id, projectChatInput);
                      }
                    }}
                    rows={1}
                  />
                  <div className={styles.inputActions}>
                    <div className={styles.inputLeft}>
                      <button className={styles.attachBtn}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <line x1="11" y1="5" x2="11" y2="17" /><line x1="5" y1="11" x2="17" y2="11" />
                        </svg>
                      </button>
                      <SolutionDropdown />
                    </div>
                    <div className={styles.inputRight}>
                      <ModelDropdown />
                      <button className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`} title={isListening ? 'Stop listening' : 'Voice Input'} onClick={toggleVoiceInput}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="22"></line>
                        </svg>
                      </button>
                      <button
                        className={`${styles.sendBtn} ${projectChatInput.trim() ? styles.sendBtnActive : ''}`}
                        onClick={() => selectedProject && startConversation(selectedProject.id, projectChatInput)}
                        disabled={!projectChatInput.trim()}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conversations list */}
                <div className={styles.projectConversations}>
                  {conversations.length === 0 ? (
                    <div className={styles.projectsEmpty}>No conversations yet. Start chatting above!</div>
                  ) : (
                    conversations.map((conv) => (
                      <div key={conv.id} className={styles.projectConvItem} onClick={() => openConversation(conv.id)}>
                        <div className={styles.projectConvTitle}>{conv.title}</div>
                        <div className={styles.projectConvMeta}>Last message {formatRelativeDate(conv.updatedAt)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ==== Edit View ==== */}
            {projectsView === 'edit' && selectedProject && (
              <div className={styles.projectsContent}>
                <div className={styles.projectsHeader}>
                  <button className={styles.projectBackBtn} onClick={() => setProjectsView('detail')}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M14 9H4M4 9l5-5M4 9l5 5" />
                    </svg>
                    Back
                  </button>
                </div>
                <div className={styles.projectFormWrap}>
                  <h2 className={styles.settingsSectionTitle}>Edit project</h2>
                  <div className={styles.settingsFieldGroup}>
                    <label className={styles.settingsLabel}>Project name</label>
                    <input
                      type="text"
                      className={styles.settingsInput}
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      autoFocus
                      maxLength={100}
                    />
                  </div>
                  <div className={styles.settingsFieldGroup}>
                    <label className={styles.settingsLabel}>Description (optional)</label>
                    <textarea
                      className={styles.settingsTextarea}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className={styles.projectFormActions}>
                    <button className={styles.settingsCancelBtn} onClick={() => setProjectsView('detail')}>Cancel</button>
                    <button className={styles.settingsSaveBtn} onClick={updateProject} disabled={!projectForm.name.trim() || projectSaving}>
                      {projectSaving ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==== Conversation View ==== */}
            {projectsView === 'conversation' && activeConversation && (
              <div className={styles.projectConvView}>
                {/* Back to project */}
                <button className={styles.projectBackLink} onClick={() => {
                  setProjectsView('detail');
                  setActiveConversation(null);
                  setConversationMessages([]);
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 8H4M4 8l4-4M4 8l4 4" />
                  </svg>
                  {selectedProject?.name || 'Back'}
                </button>

                <h2 className={styles.projectConvViewTitle}>{activeConversation.title}</h2>

                {/* Messages */}
                <div className={styles.projectConvMessages}>
                  {conversationMessages.map((msg, idx) => (
                    <div key={msg.id} className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgUser : styles.msgAssistant}`}>
                      {msg.role === 'assistant' && (
                        <div className={styles.msgAvatar}>
                          <img src={logo} alt="" className={`${styles.avatarImg} ${projectChatLoading && idx === conversationMessages.length - 1 ? styles.avatarGlow : ''}`} />
                        </div>
                      )}
                      <div className={`${styles.msgBubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
                        {msg.content.split('\n').map((line, i) => (
                          <p key={i} className={styles.msgLine}>
                            {line.split('**').map((part, j) =>
                              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}

                  {projectChatLoading && (
                    <div className={`${styles.msgRow} ${styles.msgAssistant}`}>
                      <div className={styles.msgAvatar}>
                        <img src={logo} alt="" className={`${styles.avatarImg} ${styles.avatarGlow}`} />
                      </div>
                      <div className={styles.typingDots}>
                        <span /><span /><span />
                      </div>
                    </div>
                  )}
                  <div ref={projectMessagesEndRef} />
                </div>

                {/* Chat input */}
                <div className={styles.bottomInput}>
                  <div className={styles.inputBoxBottom}>
                    <textarea
                      className={styles.textarea}
                      placeholder="Reply..."
                      value={projectChatInput}
                      onChange={(e) => setProjectChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && activeConversation) {
                          e.preventDefault();
                          sendProjectMessage(activeConversation.id, projectChatInput);
                        }
                      }}
                      rows={1}
                    />
                    <div className={styles.inputActions}>
                      <div className={styles.inputLeft}>
                        <button className={styles.attachBtn}>
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <line x1="11" y1="5" x2="11" y2="17" /><line x1="5" y1="11" x2="17" y2="11" />
                          </svg>
                        </button>
                        <SolutionDropdown />
                      </div>
                      <div className={styles.inputRight}>
                        <ModelDropdown />
                        <button className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`} title={isListening ? 'Stop listening' : 'Voice Input'} onClick={toggleVoiceInput}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="22"></line>
                          </svg>
                        </button>
                        <button
                          className={`${styles.sendBtn} ${projectChatInput.trim() ? styles.sendBtnActive : ''}`}
                          onClick={() => activeConversation && sendProjectMessage(activeConversation.id, projectChatInput)}
                          disabled={!projectChatInput.trim() || projectChatLoading}
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== CHATS PAGE (inline in main) ==================== */}
        {chatsPageOpen && (
          <div className={styles.projectsInline}>
            {/* Top bar */}
            <div className={styles.settingsTopBar}>
              {!sidebarOpen && (
                <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 5h14M3 10h14M3 15h14" />
                  </svg>
                </button>
              )}
              <div className={styles.topBarSpacer} />
              <button className={styles.settingsClose} onClick={() => setChatsPageOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            <div className={styles.projectsContent}>
              {/* Header */}
              <div className={styles.projectsHeader}>
                <h1 className={styles.projectsTitle}>Chats</h1>
                <button className={styles.projectNewBtn} onClick={startNewChat}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" />
                  </svg>
                  New chat
                </button>
              </div>

              {/* Search */}
              <div className={styles.projectsToolbar}>
                <div className={styles.projectsSearchWrap}>
                  <svg className={styles.projectsSearchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
                  </svg>
                  <input
                    className={styles.projectsSearch}
                    placeholder="Search your chats..."
                    value={chatsSearch}
                    onChange={(e) => setChatsSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Info line */}
              <div className={styles.chatsInfoLine}>
                Your chats with AICaffe
              </div>

              {/* Chats list */}
              {filteredChats.length === 0 ? (
                <div className={styles.projectsEmpty}>
                  {chatsSearch ? 'No chats match your search.' : 'No chats yet. Start a new conversation!'}
                </div>
              ) : (
                <div className={styles.chatsList}>
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={styles.chatsListItem}
                      onClick={() => { setChatsPageOpen(false); loadConversation(chat.id); }}
                    >
                      <div className={styles.chatsListTitle}>{chat.title}</div>
                      <div className={styles.chatsListMeta}>
                        Last message {formatRelativeDate(chat.updatedAt)}
                        {chat.projectName && <span> in {chat.projectName}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==================== UPGRADE PLAN ==================== */}
      {upgradeOpen && (
        <div className={styles.upgradeOverlay}>
          <div className={styles.upgradeScreen}>
            {/* Back button */}
            <button className={styles.upgradeBack} onClick={() => setUpgradeOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 10H5M5 10l5-5M5 10l5 5" />
              </svg>
            </button>

            <h1 className={styles.upgradeTitle}>Plans that grow with you</h1>

            {/* Tab toggle */}
            <div className={styles.upgradeTabToggle}>
              <button
                className={`${styles.upgradeTabBtn} ${upgradePlanTab === 'individual' ? styles.upgradeTabBtnActive : ''}`}
                onClick={() => setUpgradePlanTab('individual')}
              >
                Individual
              </button>
              <button
                className={`${styles.upgradeTabBtn} ${upgradePlanTab === 'team' ? styles.upgradeTabBtnActive : ''}`}
                onClick={() => setUpgradePlanTab('team')}
              >
                Team and Enterprise
              </button>
            </div>

            {/* ---- Individual Plans ---- */}
            {upgradePlanTab === 'individual' && (
              <div className={styles.upgradePlansRow}>
                {/* Free */}
                <div className={styles.upgradePlanCard}>
                  <div className={styles.planCardTop}>
                    <div className={styles.planIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="16" cy="8" r="3" /><path d="M16 11v10M10 17l6 4 6-4M10 17l-4 3M22 17l4 3" />
                        <circle cx="6" cy="23" r="2" /><circle cx="26" cy="23" r="2" /><circle cx="16" cy="25" r="2" />
                      </svg>
                    </div>
                    <h3 className={styles.planName}>Free</h3>
                    <p className={styles.planDesc}>Meet AICaffe</p>
                    <div className={styles.planPrice}><span className={styles.planAmount}>$0</span></div>
                    <button className={styles.planOutlineBtn}>Use AICaffe for free</button>
                  </div>
                  <ul className={styles.planFeatures}>
                    <li>Chat on web, iOS, Android, and desktop</li>
                    <li>Generate code and visualize data</li>
                    <li>Connect Slack and Google Workspace</li>
                    <li>Extended thinking for complex work</li>
                    <li>Built-in web search</li>
                    <li>Write, edit, and create content</li>
                    <li>Analyze text and images</li>
                    <li>Create files and execute code</li>
                    <li>Unlock more from AICaffe with desktop extensions</li>
                    <li>Integrate any context or tool through connectors with remote MCP</li>
                  </ul>
                </div>

                {/* Pro */}
                <div className={styles.upgradePlanCard}>
                  <div className={styles.planCardTop}>
                    <div className={styles.planBillingToggle}>
                      <button
                        className={`${styles.billingBtn} ${billingCycle === 'monthly' ? styles.billingBtnActive : ''}`}
                        onClick={() => setBillingCycle('monthly')}
                      >Monthly</button>
                      <button
                        className={`${styles.billingBtn} ${billingCycle === 'yearly' ? styles.billingBtnActive : ''}`}
                        onClick={() => setBillingCycle('yearly')}
                      >Yearly <span className={styles.billingSave}>· Save 17%</span></button>
                    </div>
                    <div className={styles.planIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="16" cy="6" r="3" /><path d="M16 9v6M10 12l6 3 6-3" />
                        <circle cx="8" cy="15" r="2" /><circle cx="24" cy="15" r="2" />
                        <path d="M8 17v4M24 17v4M16 15v6" />
                        <circle cx="8" cy="24" r="2" /><circle cx="16" cy="24" r="2" /><circle cx="24" cy="24" r="2" />
                      </svg>
                    </div>
                    <h3 className={styles.planName}>Pro</h3>
                    <p className={styles.planDesc}>Research, code, and organize</p>
                    <div className={styles.planPrice}>
                      <span className={styles.planAmount}>${billingCycle === 'yearly' ? '17' : '20'}</span>
                      <span className={styles.planPeriod}>USD / month{billingCycle === 'yearly' ? <><br/>billed annually</> : ''}</span>
                    </div>
                    <button className={styles.planFilledBtn}>Get Pro plan</button>
                  </div>
                  <div className={styles.planFeaturesHeader}>Everything in Free and:</div>
                  <ul className={styles.planFeatures}>
                    <li>AICaffe Code directly in your codebase</li>
                    <li>Power through tasks with Cowork</li>
                    <li>Higher usage limits</li>
                    <li>Deep research and analysis</li>
                    <li>Memory that carries across conversations</li>
                    <li>Unlimited projects</li>
                    <li>More AICaffe models</li>
                    <li>AICaffe in Excel</li>
                    <li>AICaffe in Chrome</li>
                  </ul>
                </div>

                {/* Max */}
                <div className={styles.upgradePlanCard}>
                  <div className={styles.planCardTop}>
                    <div className={styles.planIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="16" cy="5" r="3" /><path d="M16 8v5" />
                        <circle cx="8" cy="13" r="2" /><circle cx="24" cy="13" r="2" /><circle cx="16" cy="16" r="2" />
                        <path d="M8 15v4M24 15v4M16 18v4M4 19l4-4M28 19l-4-4" />
                        <circle cx="4" cy="22" r="2" /><circle cx="28" cy="22" r="2" />
                        <circle cx="8" cy="25" r="2" /><circle cx="16" cy="25" r="2" /><circle cx="24" cy="25" r="2" />
                      </svg>
                    </div>
                    <h3 className={styles.planName}>Max</h3>
                    <p className={styles.planDesc}>Higher limits, priority access</p>
                    <div className={styles.planPrice}>
                      <span className={styles.planAmount}>From $100</span>
                      <span className={styles.planPeriod}>USD / month<br/>billed monthly</span>
                    </div>
                    <button className={styles.planFilledBtn}>Get Max plan</button>
                  </div>
                  <div className={styles.planFeaturesHeader}>Everything in Pro, plus:</div>
                  <ul className={styles.planFeatures}>
                    <li>Up to 20x more usage than Pro*</li>
                    <li>Early access to advanced AICaffe features</li>
                    <li>Higher output limits for all tasks</li>
                    <li>Priority access at high traffic times</li>
                    <li>AICaffe in PowerPoint</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ---- Team and Enterprise ---- */}
            {upgradePlanTab === 'team' && (
              <div className={styles.upgradePlansRow}>
                {/* Team */}
                <div className={styles.upgradePlanCard}>
                  <div className={styles.planCardTop}>
                    <div className={styles.planCardTopRow}>
                      <div className={styles.planIcon}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="6" y="4" width="20" height="24" rx="2" />
                          <rect x="10" y="8" width="12" height="8" rx="1" />
                          <path d="M10 20h12M10 24h8" />
                        </svg>
                      </div>
                      <span className={styles.planUsers}>5-150 users</span>
                    </div>
                    <h3 className={styles.planName}>Team</h3>
                    <p className={styles.planDesc}>Predictable usage per seat</p>

                    <div className={styles.planSeats}>
                      <div className={styles.planSeatRow}>
                        <div>
                          <div className={styles.seatName}>Standard seat</div>
                          <p className={styles.seatDesc}>All AICaffe features, plus more usage than Pro*<br/>$25 /mo when billed monthly</p>
                        </div>
                        <div className={styles.seatPrice}>$20 <span>/mo</span></div>
                      </div>
                      <div className={styles.planSeatDivider} />
                      <div className={styles.planSeatRow}>
                        <div>
                          <div className={styles.seatName}>Premium seat</div>
                          <p className={styles.seatDesc}>5x more usage than standard seats*<br/>$125 /mo when billed monthly</p>
                        </div>
                        <div className={styles.seatPrice}>$100 <span>/mo</span></div>
                      </div>
                    </div>
                  </div>
                  <ul className={styles.planFeatures}>
                    <li>200K context window</li>
                    <li>Extra usage available at API rates</li>
                    <li>AICaffe Code</li>
                    <li>Cowork</li>
                    <li>Central billing and administration</li>
                    <li>Single sign-on (SSO) and domain capture</li>
                    <li>Admin controls for remote and local connectors</li>
                    <li>Enterprise deployment for the AICaffe desktop app</li>
                    <li>Enterprise search across your organization</li>
                    <li>Connect Microsoft 365, Slack, and more</li>
                    <li>No model training on your content by default</li>
                  </ul>
                  <button className={styles.planFilledBtnFull}>Get Team plan</button>
                </div>

                {/* Enterprise */}
                <div className={styles.upgradePlanCard}>
                  <div className={styles.planCardTop}>
                    <div className={styles.planCardTopRow}>
                      <div className={styles.planIcon}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="4" y="8" width="24" height="20" rx="2" /><path d="M4 14h24" />
                          <rect x="8" y="2" width="16" height="8" rx="2" />
                          <path d="M10 18h5v4h-5zM17 18h5v4h-5z" />
                        </svg>
                      </div>
                      <span className={styles.planUsers}>20+ users</span>
                    </div>
                    <h3 className={styles.planName}>Enterprise</h3>
                    <p className={styles.planDesc}>Flexible pooled usage</p>

                    <div className={styles.planApiBox}>
                      <div className={styles.apiBoxTitle}>Seat price + usage at <u>API rates</u></div>
                      <p className={styles.apiBoxDesc}>$20/seat. Usage cost scales with model and task.</p>
                    </div>
                  </div>
                  <div className={styles.planFeaturesHeader}>All Team features, plus:</div>
                  <ul className={styles.planFeatures}>
                    <li>Pay-as-you-go pricing with pooled usage across your org</li>
                    <li>Set user and org spend limits</li>
                    <li>500K context window</li>
                    <li>Role-based access with fine grained permissioning</li>
                    <li>System for Cross-domain Identity Management (SCIM)</li>
                    <li>Audit logs</li>
                    <li>Compliance API for observability and monitoring</li>
                    <li>Network-level access control</li>
                    <li>Custom data retention controls</li>
                    <li>IP allowlisting</li>
                    <li>Google Docs cataloging</li>
                  </ul>
                  <button className={styles.planFilledBtnFull}>Get Enterprise plan</button>
                </div>
              </div>
            )}

            <p className={styles.upgradeDisclaimer}>*Usage limits apply. Prices shown don't include applicable tax.</p>
          </div>
        </div>
      )}

      {/* ==================== SEARCH OVERLAY ==================== */}
      {searchOpen && (
        <div className={styles.searchOverlay} onClick={() => setSearchOpen(false)}>
          <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
            {/* Search header */}
            <div className={styles.searchHeader}>
              <svg className={styles.searchHeaderIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="9" cy="9" r="6" /><path d="M14 14l4 4" />
              </svg>
              <input
                ref={searchInputRef}
                className={styles.searchInput}
                type="text"
                placeholder="Search chats and projects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button className={styles.searchCloseBtn} onClick={() => setSearchOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            </div>

            {/* Results */}
            <div className={styles.searchResults}>
              {searchLoading ? (
                <div className={styles.searchEmpty}>Loading...</div>
              ) : totalSearchResults === 0 ? (
                <div className={styles.searchEmpty}>No results found</div>
              ) : (
                <>
                  {filteredSearchProjects.map((p, i) => (
                    <div
                      key={p.id}
                      className={`${styles.searchItem} ${searchHighlight === i ? styles.searchItemActive : ''}`}
                      onClick={() => handleSearchSelect(i)}
                      onMouseEnter={() => setSearchHighlight(i)}
                    >
                      <svg className={styles.searchItemIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v1H2V4zM2 5h12v7a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                      </svg>
                      <span className={styles.searchItemTitle}>{p.name}</span>
                      {searchHighlight === i && <span className={styles.searchItemEnter}>Enter</span>}
                    </div>
                  ))}

                  {filteredSearchChats.map((c, i) => {
                    const idx = filteredSearchProjects.length + i;
                    return (
                      <div
                        key={c.id}
                        className={`${styles.searchItem} ${searchHighlight === idx ? styles.searchItemActive : ''}`}
                        onClick={() => handleSearchSelect(idx)}
                        onMouseEnter={() => setSearchHighlight(idx)}
                      >
                        <svg className={styles.searchItemIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M2 4c0-1.1.9-2 2-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
                          <path d="M6 6h4M6 9h2" />
                        </svg>
                        <span className={styles.searchItemTitle}>{c.title}</span>
                        <span className={styles.searchItemMeta}>{searchRelativeDate(c.updatedAt)}</span>
                        {searchHighlight === idx && <span className={styles.searchItemEnter}>Enter</span>}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
