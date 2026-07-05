import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, LogOut, Plus, Pencil, Trash2, Sparkles, RefreshCw, X, Search,
  EyeOff, Eye, Save, AlertTriangle, LogIn,
} from 'lucide-react';
import {
  useAdminProducts, createProduct, updateProduct, deleteProductAdmin, setDiscontinuedAdmin,
  generateProductCopyWithGemini, IMAGES, CATEGORY_IDS,
} from './productStore.js';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const TOKEN_KEY = 'token'; // same assumption as productStore.js — where the frontend stores the JWT from authController.js's `?token=` redirect
const GEMINI_KEY_STORAGE = 'kamitsubaki_admin_gemini_key';

// ============================================================================
// AUTH GATE
// This now checks your REAL backend auth (GET /api/auth/me, added to
// authController.js) instead of a client-side password. Three states:
//   - no token yet            → "Log in with Google" (kicks off your existing OAuth flow)
//   - token, but not an admin → blocked, with a clear reason
//   - token + isAdmin: true   → dashboard
//
// Route-level obscurity still matters here too: don't link this page from
// anywhere in the public site nav, and mount it at a non-guessable path.
// ============================================================================
function useAuthCheck() {
  const [state, setState] = useState('checking'); // checking | loggedOut | forbidden | ok
  const [me, setMe] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setState('loggedOut'); return; }

    fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('unauthorized');
        return res.json();
      })
      .then((user) => {
        setMe(user);
        setState(user.isAdmin ? 'ok' : 'forbidden');
      })
      .catch(() => setState('loggedOut'));
  }, []);

  return { state, me };
}

function AdminGate({ state }) {
  // ASSUMPTION: your Google OAuth start route — confirm this against
  // whatever mounts googleCallback in your routes (commonly something like
  // `router.get('/google', passport.authenticate('google', {...}))`).
  const googleLoginUrl = `${API_BASE}/api/auth/google`;

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4" style={{ background: 'radial-gradient(circle at 50% -10%, rgba(193,18,31,0.18), transparent 55%), #050506' }}>
      <div className="w-full max-w-sm p-6 rounded-2xl text-center" style={{ background: 'rgba(16,16,22,0.85)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="flex items-center justify-center gap-2 mb-2 text-red-400"><Lock size={18} /><h1 className="font-cinematic text-lg text-white">Admin Access</h1></div>
        <p className="text-xs text-white/40 mb-5">Dev-only. Not linked anywhere on the public site.</p>

        {state === 'forbidden' ? (
          <p className="text-sm text-red-400 mb-5">You're logged in, but this account isn't marked as admin.</p>
        ) : (
          <a
            href={googleLoginUrl}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-bold uppercase tracking-widest transition-colors"
          >
            <LogIn size={14} /> Log in with Google
          </a>
        )}
        <Link to="/" className="block text-center text-[11px] text-white/30 hover:text-white/60 mt-4">← Back to site</Link>
      </div>
    </div>
  );
}

const emptyDraft = {
  name: '', category: 'ao', price: 0, image: IMAGES[0],
  description: '', seoTitle: '', seoDescription: '', keywords: [], brief: '', discontinued: false,
};

function ProductForm({ initial, apiKey, onSave, onCancel, saving, saveError }) {
  const isNew = !initial;
  const [draft, setDraft] = useState(() => initial ? { ...initial, keywords: initial.keywords || [] } : { ...emptyDraft });
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  const handleGenerate = async () => {
    setGenError('');
    setGenLoading(true);
    try {
      const copy = await generateProductCopyWithGemini(apiKey, draft.brief, draft.category);
      setDraft((d) => ({ ...d, ...copy }));
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleSave = () => {
    if (!draft.name.trim()) { setGenError('Name is required.'); return; }
    // slug/_id/timestamps are managed server-side now — only send editable fields
    const { id, slug, _id, createdAt, updatedAt, createdBy, __v, ...payload } = draft;
    onSave({ ...payload, price: Number(draft.price) || 0, _id: initial?._id });
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onCancel} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[460px] z-50 flex flex-col overflow-y-auto" style={{ background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{ background: '#0a0a0f', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="font-cinematic text-base">{isNew ? 'New Product' : 'Edit Product'}</h2>
          <button onClick={onCancel}><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4 flex-1">
          {/* Gemini generator */}
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(76,110,245,0.08)', border: '1px solid rgba(76,110,245,0.3)' }}>
            <label className="text-[11px] uppercase tracking-wider text-blue-300 flex items-center gap-1.5"><Sparkles size={12} /> Product brief (for Gemini)</label>
            <textarea
              value={draft.brief} onChange={set('brief')} rows={2}
              placeholder="e.g. Isekaijoucho tour hoodie, black, glow-print logo on back"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-blue-500 text-xs resize-none"
            />
            <button
              onClick={handleGenerate} disabled={genLoading}
              className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
              style={{ background: '#4c6ef5', color: '#fff' }}
            >
              {genLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {genLoading ? 'Generating…' : (initial?.name ? 'Re-run with Gemini' : 'Generate with Gemini')}
            </button>
            {genError && <p className="text-[11px] text-red-400">{genError}</p>}
            {!apiKey && <p className="text-[11px] text-white/40">Add a Gemini API key above to enable this.</p>}
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/40">Category</label>
            <select value={draft.category} onChange={set('category')} className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm outline-none focus:border-red-500">
              {CATEGORY_IDS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/40">Image</label>
            <div className="flex gap-2 mt-1 mb-2">
              {IMAGES.map((img) => (
                <button key={img} onClick={() => setDraft((d) => ({ ...d, image: img }))}
                  className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ border: draft.image === img ? '2px solid #ff3d4d' : '1px solid rgba(255,255,255,0.15)' }}>
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = 0.15; }} />
                </button>
              ))}
            </div>
            <input value={draft.image} onChange={set('image')} placeholder="/merch/your-photo.webp" className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-red-500 text-xs" />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/40">Price (VND)</label>
            <input type="number" value={draft.price} onChange={set('price')} className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-red-500 text-sm" />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/40">Name</label>
            <input value={draft.name} onChange={set('name')} className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-red-500 text-sm" />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/40">Description</label>
            <textarea value={draft.description} onChange={set('description')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-red-500 text-sm resize-none" />
          </div>

          <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">SEO metadata</p>
            <input value={draft.seoTitle} onChange={set('seoTitle')} placeholder="SEO title (<60 chars)" className="w-full mb-2 px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-red-500 text-xs" />
            <textarea value={draft.seoDescription} onChange={set('seoDescription')} rows={2} placeholder="SEO meta description (<160 chars)" className="w-full mb-2 px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-red-500 text-xs resize-none" />
            <input
              value={(draft.keywords || []).join(', ')}
              onChange={(e) => setDraft((d) => ({ ...d, keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) }))}
              placeholder="keywords, comma, separated"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-red-500 text-xs"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-white/60 pt-2">
            <input type="checkbox" checked={draft.discontinued} onChange={(e) => setDraft((d) => ({ ...d, discontinued: e.target.checked }))} />
            Discontinued (hidden from storefront)
          </label>

          {saveError && <p className="text-xs text-red-400">{saveError}</p>}
        </div>

        <div className="p-5 sticky bottom-0 flex gap-2" style={{ background: '#0a0a0f', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />} {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}

function AdminDashboard() {
  const { products, loading, error: loadError, refresh } = useAdminProducts();
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem(GEMINI_KEY_STORAGE) || '');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | discontinued
  const [editing, setEditing] = useState(null); // null = closed, {} = new, product = edit
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [rowBusy, setRowBusy] = useState(null); // id of row mid-action (discontinue/delete), disables its buttons

  useEffect(() => { sessionStorage.setItem(GEMINI_KEY_STORAGE, apiKey); }, [apiKey]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter === 'active' && p.discontinued) return false;
      if (statusFilter === 'discontinued' && !p.discontinued) return false;
      if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [products, search, statusFilter]);

  const handleSave = async (product) => {
    setSaveError('');
    setSaving(true);
    try {
      if (product._id) await updateProduct(product._id, product);
      else await createProduct(product);
      setEditing(null);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    setRowBusy(product._id);
    try {
      await deleteProductAdmin(product._id);
      setConfirmDelete(null);
    } catch (err) {
      alert(err.message); // simple surfacing — swap for a toast if you'd like it less blunt
    } finally {
      setRowBusy(null);
    }
  };

  const handleToggleDiscontinued = async (product) => {
    setRowBusy(product._id);
    try {
      await setDiscontinuedAdmin(product._id, !product.discontinued);
    } catch (err) {
      alert(err.message);
    } finally {
      setRowBusy(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen text-white" style={{ background: '#050506' }}>
      <header className="sticky top-0 z-20 backdrop-blur-md" style={{ background: 'rgba(5,5,8,0.9)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-cinematic text-lg tracking-wide">神椿 <span className="text-red-500">ADMIN</span></h1>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input
              type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Gemini API key (AIzaSy...)"
              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-blue-500 text-xs"
            />
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/50 hover:text-red-400 transition-colors">
            <LogOut size={13} /> Log out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-red-500 text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-red-500">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="discontinued">Discontinued</option>
          </select>
          <button onClick={refresh} title="Refresh" className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setEditing({})} className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-colors">
            <Plus size={14} /> New Product
          </button>
        </div>

        {loadError && (
          <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5"><AlertTriangle size={13} /> {loadError}</p>
        )}

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-white/30 text-sm">Loading…</td></tr>
              ) : filtered.map((p) => (
                <tr key={p._id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', opacity: rowBusy === p._id ? 0.5 : 1 }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" style={{ background: '#141420' }} onError={(e) => { e.currentTarget.style.opacity = 0.15; }} />
                      <span className="line-clamp-1 max-w-[220px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 hidden sm:table-cell">{p.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{p.price.toLocaleString('vi-VN')}₫</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${p.discontinued ? 'text-white/50' : 'text-emerald-300'}`} style={{ background: p.discontinued ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.15)' }}>
                      {p.discontinued ? 'Discontinued' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditing(p)} disabled={rowBusy === p._id} title="Edit" className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-40"><Pencil size={14} /></button>
                      <button
                        onClick={() => handleToggleDiscontinued(p)}
                        disabled={rowBusy === p._id}
                        title={p.discontinued ? 'Reactivate' : 'Discontinue'}
                        className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-40"
                      >
                        {p.discontinued ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => setConfirmDelete(p)} disabled={rowBusy === p._id} title="Delete" className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-red-400 disabled:opacity-40"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-white/30 text-sm">No products match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {editing !== null && (
        <ProductForm
          initial={editing._id ? editing : null}
          apiKey={apiKey}
          saving={saving}
          saveError={saveError}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setSaveError(''); }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={() => setConfirmDelete(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-sm w-full rounded-2xl p-6" style={{ background: '#0d0d13', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center gap-2 text-red-400 mb-3"><AlertTriangle size={18} /><h3 className="font-semibold text-white">Delete product?</h3></div>
            <p className="text-sm text-white/50 mb-5">"{confirmDelete.name}" will be permanently removed. This can't be undone — consider Discontinue instead if you might need it again.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-500">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { state } = useAuthCheck();
  useEffect(() => { document.title = 'Admin · Kamitsubaki Studio'; }, []);
  if (state === 'checking') return <div className="min-h-screen flex items-center justify-center text-white/40 text-sm" style={{ background: '#050506' }}>Checking session…</div>;
  if (state === 'ok') return <AdminDashboard />;
  return <AdminGate state={state} />;
}