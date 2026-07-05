import { useEffect, useState } from 'react';
//E:\Project\react-navbar-new\src\pages\lib\productStore.js
// ============================================================================
// PRODUCT API CLIENT
// Talks to your real Express/Mongoose backend now (see /backend in this
// delivery). Two halves:
//   - Public functions (getProducts, useProducts) — no auth, active items
//     only, used by the storefront (services.jsx). Unchanged call signature
//     from the localStorage version, so services.jsx didn't need to change.
//   - Admin functions (useAdminProducts, createProduct, updateProduct,
//     deleteProductAdmin, setDiscontinuedAdmin) — require a Bearer token,
//     used only by Admin.jsx.
//
// Set VITE_API_BASE in your frontend .env to point at the backend
// (defaults to http://localhost:5000 for local dev).
// ============================================================================

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
export const IMAGES = ['/merch1.webp', '/merch2.webp', '/merch3.webp', '/merch4.webp'];
export const CATEGORY_IDS = ['ao', 'phukien', 'vpp', 'khac'];

// ASSUMPTION: your frontend stores the JWT from authController.js's
// `?token=` redirect under localStorage key "token". Adjust here if it's
// stored differently.
const TOKEN_KEY = 'token';
function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleRes(res) {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const body = await res.json(); if (body?.error) msg = body.error; } catch { /* non-JSON error body */ }
    throw new Error(msg);
  }
  return res.json();
}

// Backend uses Mongo's `slug` as the public-facing id (what shows up in
// ?product= URLs and cart line items); `_id` is kept too, since admin
// edit/delete/discontinue calls need the real Mongo id.
function normalize(p) {
  return { ...p, id: p.slug };
}

// -------------------- PUBLIC (storefront) --------------------

export async function fetchProductsPage({ page = 1, category = 'all' } = {}) {
  const params = new URLSearchParams({ page: String(page) });
  if (category && category !== 'all') params.set('cat', category);
  const data = await handleRes(await fetch(`${API_BASE}/api/products?${params}`));
  return { ...data, products: data.products.map(normalize) };
}

export async function fetchProductBySlug(slug) {
  return normalize(await handleRes(await fetch(`${API_BASE}/api/products/${slug}`)));
}

// Returns the full active catalog (loops every page of the public endpoint).
// Kept as a single function — rather than switching services.jsx over to
// server-side pagination — so its existing client-side pagination/filtering
// code didn't need to change. Fine for a catalog of dozens–low hundreds of
// items; if this grows into the thousands, switch services.jsx to call
// fetchProductsPage() directly instead.
export async function getProducts() {
  let page = 1, all = [], totalPages = 1;
  do {
    const data = await fetchProductsPage({ page });
    all = all.concat(data.products);
    totalPages = data.totalPages;
    page += 1;
  } while (page <= totalPages);
  return all;
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    let alive = true;
    const load = () => getProducts().then((p) => { if (alive) setProducts(p); }).catch(() => {});
    load();
    window.addEventListener('kamitsubaki-products-changed', load);
    return () => { alive = false; window.removeEventListener('kamitsubaki-products-changed', load); };
  }, []);
  return products;
}

// -------------------- ADMIN (Admin.jsx only) --------------------

export async function fetchAdminProducts() {
  return handleRes(await fetch(`${API_BASE}/api/admin/products`, { headers: authHeaders() }));
}

export function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = () => {
    setLoading(true);
    fetchAdminProducts()
      .then((p) => { setProducts(p); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    window.addEventListener('kamitsubaki-products-changed', refresh);
    return () => window.removeEventListener('kamitsubaki-products-changed', refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { products, loading, error, refresh };
}

function notifyChanged() {
  window.dispatchEvent(new CustomEvent('kamitsubaki-products-changed'));
}

export async function createProduct(product) {
  const result = await handleRes(
    await fetch(`${API_BASE}/api/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(product),
    })
  );
  notifyChanged();
  return result;
}

export async function updateProduct(mongoId, product) {
  const result = await handleRes(
    await fetch(`${API_BASE}/api/admin/products/${mongoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(product),
    })
  );
  notifyChanged();
  return result;
}

export async function deleteProductAdmin(mongoId) {
  const result = await handleRes(
    await fetch(`${API_BASE}/api/admin/products/${mongoId}`, { method: 'DELETE', headers: authHeaders() })
  );
  notifyChanged();
  return result;
}

export async function setDiscontinuedAdmin(mongoId, discontinued) {
  const result = await handleRes(
    await fetch(`${API_BASE}/api/admin/products/${mongoId}/discontinue`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ discontinued }),
    })
  );
  notifyChanged();
  return result;
}

export function slugify(name) {
  return 'sp-' + name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip Vietnamese diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || `sp-${Date.now()}`;
}

// -------------------- VNPAY CHECKOUT --------------------
// Real network call now — the backend recomputes the total from the DB
// itself (never trusts a client-submitted amount), builds the signed VNPay
// URL server-side, and hands it back for the browser to redirect to.
export async function payWithVNPay({ items }) {
  const { paymentUrl } = await handleRes(
    await fetch(`${API_BASE}/api/vnpay/create-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ items }),
    })
  );
  window.location.href = paymentUrl; // real redirect to VNPay's hosted checkout
}

// -------------------- GEMINI PRODUCT-COPY GENERATOR --------------------
// Unchanged — this still talks directly to Google's API from the browser
// using the admin's own Gemini key, same as About.jsx's askGemini. No
// backend involvement needed here.
export async function generateProductCopyWithGemini(apiKey, brief, category) {
  if (!apiKey) throw new Error('Missing Gemini API key.');
  if (!brief?.trim()) throw new Error('Write a short product brief first.');

  const prompt = `You are an e-commerce copywriter for KAMITSUBAKI STUDIO, an official Vietnamese merch store for a virtual idol label (talents: KAF, RIM, Harusaruhi, Isekaijoucho, Koko Rinne; the group V.W.P; and the anime "Kamitsubaki City Under Construction").

Given the short product brief below, write storefront copy AND SEO metadata for the product page. Reply with STRICT JSON ONLY — no markdown fences, no commentary — matching exactly this shape:
{
  "name": "Vietnamese product name, concise and on-brand",
  "description": "2-3 sentence Vietnamese storefront product description, warm and inviting",
  "seoTitle": "English SEO title, under 60 characters",
  "seoDescription": "English SEO meta description, under 160 characters",
  "keywords": ["5 to 8 lowercase SEO keywords/phrases, English"]
}

Category: ${category}
Product brief: ${brief}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 500, responseMimeType: 'application/json' },
      }),
    }
  );
  if (!res.ok) { const errText = await res.text(); throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 200)}`); }
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '{}';
  try {
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || '',
      description: parsed.description || '',
      seoTitle: parsed.seoTitle || '',
      seoDescription: parsed.seoDescription || '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    };
  } catch {
    throw new Error('Gemini returned something that wasn\'t valid JSON — try again.');
  }
}