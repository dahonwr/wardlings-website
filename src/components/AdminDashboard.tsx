import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Users, Image as ImageIcon, Settings as SettingsIcon, BarChart3, Download, Copy, Check, Search, Filter, Trash2, Plus } from 'lucide-react';
import { Application, Settings, GalleryItem, RarityCategory, WhitelistStatus } from '../types';
import { fetchSettings, saveSettings, fetchGallery, saveGalleryItem, deleteGalleryItem } from '../lib/storage';
import { fetchAllApplications, updateApplicationStatusAndNotes } from '../services/whitelistService';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'applications' | 'gallery' | 'settings' | 'analytics'>('applications');

  // Applications Data
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | WhitelistStatus>('All');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settings Data
  const [settingsForm, setSettingsForm] = useState<Settings>({
    twitter_follow: '',
    twitter_like: '',
    twitter_repost: '',
    twitter_comment: '',
    application_open: true,
    discord_link: '',
    website_banner: '',
    hero_illustration: ''
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Gallery Data
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCat, setNewGalleryCat] = useState<RarityCategory>('Common');
  const [newGalleryDesc, setNewGalleryDesc] = useState('');

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAllData();
    }
  }, [isOpen, isAuthenticated]);

  const loadAllData = async () => {
    // Fetch directly from Supabase
    const dbApps = await fetchAllApplications();

    // Map Supabase whitelist_applications to legacy Application interface
    const mapped: Application[] = dbApps.map(a => ({
      id: a.id,
      created_at: a.created_at,
      twitter_username: a.x_handle,
      x_handle: a.x_handle,
      wallet_address: a.wallet_address || 'Pending',
      comment_link: a.comment_link || undefined,
      status: a.status || 'pending',
      completed_tasks: a.completed || (a.current_step >= 4),
      current_step: a.current_step,
      completed: a.completed
    }));

    setApplications(mapped);

    const st = await fetchSettings();
    setSettingsForm(st);

    const gal = await fetchGallery();
    setGalleryItems(gal);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'sanctuary2026' || passwordInput === 'admin') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Try "sanctuary2026"');
    }
  };

  // Status update directly in Supabase
  const handleStatusChange = async (id: string, newStatus: WhitelistStatus) => {
    await updateApplicationStatusAndNotes(id, newStatus);
    loadAllData();
  };

  // Save notes directly in Supabase
  const handleSaveNotes = async (id: string) => {
    const currentApp = applications.find(a => a.id === id);
    if (currentApp) {
      await updateApplicationStatusAndNotes(id, currentApp.status, tempNotes);
    }
    setEditingNotesId(null);
    loadAllData();
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'X Handle', 'Wallet Address', 'Comment Link', 'Status', 'Completed'];
    const rows = applications.map(a => [
      a.id,
      a.created_at,
      `@${a.twitter_username}`,
      a.wallet_address,
      a.comment_link || '',
      a.status,
      a.completed ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wardlings_supabase_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy helper
  const copyToClipboard = (text: string, idStr: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idStr);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settingsForm);
    setSettingsSaved(true);
    if (onSettingsUpdated) onSettingsUpdated();
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Add Gallery Item
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl || !newGalleryTitle) return;

    await saveGalleryItem({
      url: newGalleryUrl,
      title: newGalleryTitle,
      category: newGalleryCat,
      description: newGalleryDesc
    });

    setNewGalleryUrl('');
    setNewGalleryTitle('');
    setNewGalleryDesc('');
    loadAllData();
  };

  // Delete Gallery Item
  const handleDeleteGallery = async (id: string) => {
    await deleteGalleryItem(id);
    loadAllData();
  };

  if (!isOpen) return null;

  // Filtered Applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.twitter_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.wallet_address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Analytics Metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const appsToday = applications.filter(a => a.created_at.slice(0, 10) === todayStr).length;
  const totalApps = applications.length;
  const uniqueWallets = new Set(applications.map(a => a.wallet_address.toLowerCase()).filter(w => w !== 'pending')).size;
  const duplicateWallets = totalApps - uniqueWallets;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2B2B2B]"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-50 w-full max-w-5xl cozy-card p-6 sm:p-8 bg-[#FFF9EF] max-h-[90vh] flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[#7C5B46]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7C5B46] text-white flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-dynapuff font-bold text-2xl text-[#2B2B2B]">
                  Sanctuary Admin Portal (Supabase Live)
                </h2>
                <p className="font-patrick text-xs text-[#7C5B46]">
                  Keeper Whitelist & Settings Control Center
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#FFF9EF] border-2 border-[#2B2B2B] hover:bg-[#F7BFD5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Login Screen if not authenticated */}
          {!isAuthenticated ? (
            <div className="py-12 px-4 max-w-md mx-auto text-center space-y-6">
              <span className="text-4xl">🔐</span>
              <h3 className="font-dynapuff font-bold text-2xl text-[#2B2B2B]">
                Keeper Sanctuary Admin Login
              </h3>
              <p className="font-nunito text-sm text-[#2B2B2B]/80">
                Enter the passcode to manage Keeper applications directly in Supabase.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter passcode (Default: sanctuary2026)"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFF9EF] border-3 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] font-mono text-center text-base focus:outline-none"
                />
                {loginError && <p className="text-red-600 font-bold text-xs">{loginError}</p>}
                <button
                  type="submit"
                  className="w-full font-dynapuff font-bold text-base py-3 rounded-2xl bg-[#7EBE69] text-white border-3 border-[#2B2B2B] shadow-[3px_3px_0px_#2B2B2B] hover:bg-[#68a853] cursor-pointer"
                >
                  Unlock Admin Portal →
                </button>
              </form>
            </div>
          ) : (
            /* Main Admin Dashboard Tabs & Content */
            <div className="flex-1 overflow-hidden flex flex-col pt-4 space-y-4">
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 border-b-2 border-[#2B2B2B]/10 pb-2">
                {[
                  { id: 'applications', label: 'Applications', icon: <Users className="w-4 h-4" /> },
                  { id: 'gallery', label: 'Gallery', icon: <ImageIcon className="w-4 h-4" /> },
                  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
                  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`font-baloo font-bold text-sm px-4 py-2 rounded-xl border-2 border-[#2B2B2B] transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#7EBE69] text-white shadow-[2px_3px_0px_#2B2B2B]'
                        : 'bg-[#FFF9EF] text-[#2B2B2B] hover:bg-[#D9F5C2]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: APPLICATIONS */}
              {activeTab === 'applications' && (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#D9F5C2]/40 p-3 rounded-2xl border-2 border-[#2B2B2B]">
                    <div className="flex items-center gap-2 flex-1">
                      <Search className="w-4 h-4 text-[#7C5B46]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search @username or 0x wallet in Supabase..."
                        className="w-full bg-white px-3 py-1.5 rounded-xl border border-[#2B2B2B] font-nunito text-xs text-[#2B2B2B] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-[#7C5B46]" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-white px-3 py-1.5 rounded-xl border border-[#2B2B2B] font-nunito text-xs text-[#2B2B2B]"
                      >
                        <option value="All">All Statuses</option>
                        <option value="pending">Pending / Growing</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <button
                        onClick={exportToCSV}
                        className="font-baloo font-bold text-xs px-3 py-1.5 rounded-xl bg-[#F7BFD5] border-2 border-[#2B2B2B] text-[#2B2B2B] hover:bg-[#f3a6c3] cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Applications Table */}
                  <div className="overflow-x-auto rounded-2xl border-2 border-[#2B2B2B] bg-white">
                    <table className="w-full text-left font-nunito text-xs">
                      <thead className="bg-[#FFF9EF] border-b-2 border-[#2B2B2B] font-dynapuff text-xs text-[#7C5B46]">
                        <tr>
                          <th className="p-3">X Handle</th>
                          <th className="p-3">EVM Wallet</th>
                          <th className="p-3">Comment Link</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Notes</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {filteredApps.map((app) => (
                          <tr key={app.id} className="hover:bg-amber-50/50">
                            <td className="p-3 font-bold">
                              <div className="flex items-center gap-1.5">
                                <span>@{app.twitter_username}</span>
                                <button
                                  onClick={() => copyToClipboard(`@${app.twitter_username}`, `u-${app.id}`)}
                                  className="text-stone-400 hover:text-[#2B2B2B]"
                                  title="Copy username"
                                >
                                  {copiedId === `u-${app.id}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                              <span className="text-[10px] text-stone-400 block font-normal">
                                {new Date(app.created_at).toLocaleDateString()}
                              </span>
                            </td>

                            <td className="p-3 font-mono text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span>{app.wallet_address.length > 12 ? `${app.wallet_address.slice(0, 6)}...${app.wallet_address.slice(-4)}` : app.wallet_address}</span>
                                {app.wallet_address !== 'Pending' && (
                                  <button
                                    onClick={() => copyToClipboard(app.wallet_address, `w-${app.id}`)}
                                    className="text-stone-400 hover:text-[#2B2B2B]"
                                    title="Copy wallet"
                                  >
                                    {copiedId === `w-${app.id}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="p-3 truncate max-w-[120px]">
                              {app.comment_link ? (
                                <a
                                  href={app.comment_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#4D7A39] underline hover:text-green-800"
                                >
                                  Link
                                </a>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </td>

                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border border-[#2B2B2B] ${
                                app.status === 'approved' ? 'bg-[#D9F5C2] text-green-900' :
                                app.status === 'rejected' ? 'bg-red-100 text-red-900' : 'bg-yellow-100 text-yellow-900'
                              }`}>
                                {app.status === 'pending' ? 'Growing' : app.status}
                              </span>
                            </td>

                            <td className="p-3 max-w-[140px]">
                              {editingNotesId === app.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={tempNotes}
                                    onChange={(e) => setTempNotes(e.target.value)}
                                    className="border rounded px-1 py-0.5 text-[11px] w-full"
                                  />
                                  <button onClick={() => handleSaveNotes(app.id)} className="text-green-600 font-bold">
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => { setEditingNotesId(app.id); setTempNotes(app.review_notes || ''); }}
                                  className="cursor-pointer hover:underline text-stone-600 truncate"
                                >
                                  {app.review_notes || '+ Add note'}
                                </div>
                              )}
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleStatusChange(app.id, 'approved')}
                                  className="px-2 py-1 rounded-lg bg-[#D9F5C2] border border-[#2B2B2B] text-green-900 font-bold text-[10px] hover:bg-green-300 cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(app.id, 'rejected')}
                                  className="px-2 py-1 rounded-lg bg-red-100 border border-[#2B2B2B] text-red-900 font-bold text-[10px] hover:bg-red-200 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: GALLERY */}
              {activeTab === 'gallery' && (
                <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                  {/* Add New Gallery Image Form */}
                  <form onSubmit={handleAddGalleryItem} className="p-4 rounded-2xl border-2 border-[#2B2B2B] bg-[#DFF4FF]/50 space-y-3">
                    <h4 className="font-dynapuff font-bold text-sm text-[#2B2B2B] flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#7EBE69]" /> Add Image to Sanctuary Gallery
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={newGalleryTitle}
                        onChange={(e) => setNewGalleryTitle(e.target.value)}
                        placeholder="Artwork Title"
                        required
                        className="bg-white px-3 py-2 rounded-xl border border-[#2B2B2B] text-xs"
                      />
                      <input
                        type="url"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        placeholder="Image URL"
                        required
                        className="bg-white px-3 py-2 rounded-xl border border-[#2B2B2B] text-xs"
                      />
                      <select
                        value={newGalleryCat}
                        onChange={(e) => setNewGalleryCat(e.target.value as any)}
                        className="bg-white px-3 py-2 rounded-xl border border-[#2B2B2B] text-xs"
                      >
                        {['Hero', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="font-dynapuff font-bold text-xs px-4 py-2 rounded-xl bg-[#7EBE69] text-white border border-[#2B2B2B] hover:bg-[#68a853] cursor-pointer"
                    >
                      Upload Artwork
                    </button>
                  </form>

                  {/* Existing Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="relative group rounded-xl border-2 border-[#2B2B2B] bg-white p-2 overflow-hidden">
                        <img src={item.url} alt={item.title} className="w-full h-32 object-cover rounded-lg" />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-bold text-xs truncate">{item.title}</span>
                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto space-y-4 pr-1">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#D9F5C2] border-2 border-[#2B2B2B]">
                    <span className="font-dynapuff font-bold text-sm text-[#2B2B2B]">
                      Keeper Applications Open
                    </span>
                    <button
                      type="button"
                      onClick={() => setSettingsForm(s => ({ ...s, application_open: !s.application_open }))}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs border-2 border-[#2B2B2B] cursor-pointer ${
                        settingsForm.application_open ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {settingsForm.application_open ? 'OPEN' : 'CLOSED'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-[#7C5B46] block mb-1">Twitter Follow URL</label>
                      <input
                        type="text"
                        value={settingsForm.twitter_follow}
                        onChange={(e) => setSettingsForm(s => ({ ...s, twitter_follow: e.target.value }))}
                        className="w-full bg-white p-2 rounded-xl border border-[#2B2B2B]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#7C5B46] block mb-1">Twitter Like URL</label>
                      <input
                        type="text"
                        value={settingsForm.twitter_like}
                        onChange={(e) => setSettingsForm(s => ({ ...s, twitter_like: e.target.value }))}
                        className="w-full bg-white p-2 rounded-xl border border-[#2B2B2B]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#7C5B46] block mb-1">Twitter Repost URL</label>
                      <input
                        type="text"
                        value={settingsForm.twitter_repost}
                        onChange={(e) => setSettingsForm(s => ({ ...s, twitter_repost: e.target.value }))}
                        className="w-full bg-white p-2 rounded-xl border border-[#2B2B2B]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#7C5B46] block mb-1">Twitter Comment URL</label>
                      <input
                        type="text"
                        value={settingsForm.twitter_comment}
                        onChange={(e) => setSettingsForm(s => ({ ...s, twitter_comment: e.target.value }))}
                        className="w-full bg-white p-2 rounded-xl border border-[#2B2B2B]"
                      />
                    </div>
                  </div>

                  {settingsSaved && (
                    <div className="p-2 rounded-xl bg-green-100 border border-green-500 text-green-800 text-xs font-bold text-center">
                      Settings updated successfully!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="font-dynapuff font-bold text-sm px-6 py-2.5 rounded-2xl bg-[#7EBE69] text-white border-2 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] hover:bg-[#68a853] cursor-pointer"
                  >
                    Save All Settings
                  </button>
                </form>
              )}

              {/* TAB 4: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[#DFF4FF] border-2 border-[#2B2B2B] text-center">
                      <span className="font-patrick text-xs text-[#7C5B46] block font-bold">TODAY</span>
                      <span className="font-dynapuff text-2xl font-bold text-[#2B2B2B]">{appsToday}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#D9F5C2] border-2 border-[#2B2B2B] text-center">
                      <span className="font-patrick text-xs text-[#7C5B46] block font-bold">TOTAL APPLICATIONS</span>
                      <span className="font-dynapuff text-2xl font-bold text-[#2B2B2B]">{totalApps}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F7BFD5] border-2 border-[#2B2B2B] text-center">
                      <span className="font-patrick text-xs text-[#7C5B46] block font-bold">UNIQUE WALLETS</span>
                      <span className="font-dynapuff text-2xl font-bold text-[#2B2B2B]">{uniqueWallets}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-100 border-2 border-[#2B2B2B] text-center">
                      <span className="font-patrick text-xs text-[#7C5B46] block font-bold">DUPLICATE WALLETS</span>
                      <span className="font-dynapuff text-2xl font-bold text-[#2B2B2B]">{duplicateWallets}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
