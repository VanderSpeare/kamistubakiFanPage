import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ShoppingBag, X, ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { img } from 'framer-motion/client';

// ============================================================================
// ASSETS — only 4 real product photos exist right now. They're cycled across
// the catalog below; drop merch5.webp, merch6.webp… into /public later and
// just add them to this array — nothing else needs to change.
// ============================================================================
const IMAGES = ['/merch1.webp', '/merch2.webp', '/merch3.webp', '/merch4.webp'];

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

// ============================================================================
// TRANSLATIONS — English is the base language; Japanese and Vietnamese are
// optional. Uses the same 'en' / 'ja' / 'vi' codes as the rest of the site
// (see About.jsx's UI object) so language choice can stay consistent if you
// wire the two pages together later.
// ============================================================================
const T = {
  en: {
    backToShop: 'Back',
    backHome: 'Back to Home',
    heroEyebrow: 'Official Store',
    heroTitle: 'KAMITSUBAKI STUDIO STORE',
    heroSub: <img src='public/guiano1.webp' alt='Kamitsubaki Studio' /> , 
    categories: { all: 'All', ao: 'Apparel', phukien: 'Accessories', vpp: 'Stationery', khac: 'Other' },
    pageInfo: (p, tt, n) => `Page ${p}/${tt} — ${n} products`,
    addToCart: 'Add to Cart',
    emptyCategory: 'No products in this category.',
    cartTitle: 'Shopping Cart',
    cartEmpty: 'Your cart is empty.',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    proceedToPayment: 'Proceed to Payment',
    checkoutTitle: 'Checkout',
    orderSummary: 'Order Summary',
    total: 'Total',
    payWith: 'Pay with',
    securePay: 'Secure payment via VNPay',
    demoNotice: 'This is a demo — in production you would be redirected to the VNPay payment page to complete your order.',
    quantity: 'Quantity',
    qty: 'Qty',
    buyNow: 'Buy Now with',
    toastAdded: (name) => `Added "${name}" to cart`,
    processing: 'Redirecting to VNPay…',
    orderPlaced: 'Order placed (demo)',
    emptyCartCheckout: 'Your cart is empty — add something first!',
    productDesc: (base, variant) => `${base}, ${variant} version. Official Kamitsubaki Studio merchandise — premium materials, crisp printing, carefully packaged before it ships to you.`,
  },
  ja: {
    backToShop: '戻る',
    backHome: 'ホームに戻る',
    heroEyebrow: '公式ストア',
    heroTitle: 'KAMITSUBAKI STUDIO STORE',
    heroSub: '神椿市建設中。公式グッズ — VNPayで簡単決済。',
    categories: { all: 'すべて', ao: 'アパレル', phukien: 'アクセサリー', vpp: '文房具', khac: 'その他' },
    pageInfo: (p, tt, n) => `${p}/${tt} ページ — ${n} 点`,
    addToCart: 'カートに追加',
    emptyCategory: 'このカテゴリーに商品はありません。',
    cartTitle: 'ショッピングカート',
    cartEmpty: 'カートは空です。',
    continueShopping: '買い物を続ける',
    subtotal: '小計',
    proceedToPayment: '支払いに進む',
    checkoutTitle: 'お会計',
    orderSummary: '注文内容',
    total: '合計',
    payWith: '支払い方法',
    securePay: 'VNPayによる安全な決済',
    demoNotice: 'これはデモです。本番環境ではVNPayの決済ページに移動します。',
    quantity: '数量',
    qty: '数量',
    buyNow: '購入する',
    toastAdded: (name) => `「${name}」をカートに追加しました`,
    processing: 'VNPayに移動しています…',
    orderPlaced: '注文完了（デモ）',
    emptyCartCheckout: 'カートが空です。先に商品を追加してください。',
    productDesc: (base, variant) => `${base}、${variant}バージョン。神椿スタジオ公式グッズ — 高品質な素材と鮮明な印刷、丁寧に梱包してお届けします。`,
  },
  vi: {
    backToShop: 'Quay lại',
    backHome: 'Về trang chủ',
    heroEyebrow: 'Cửa Hàng Chính Thức',
    heroTitle: 'KAMITSUBAKI STUDIO STORE',
    heroSub: 'Merch chính thức từ 神椿市建設中。— thanh toán nhanh qua VNPay.',
    categories: { all: 'Tất cả', ao: 'Áo', phukien: 'Phụ kiện', vpp: 'Văn phòng phẩm', khac: 'Khác' },
    pageInfo: (p, tt, n) => `Trang ${p}/${tt} — ${n} sản phẩm`,
    addToCart: 'Thêm vào giỏ',
    emptyCategory: 'Không có sản phẩm nào trong danh mục này.',
    cartTitle: 'Giỏ hàng',
    cartEmpty: 'Giỏ hàng của bạn đang trống.',
    continueShopping: 'Tiếp tục mua sắm',
    subtotal: 'Tạm tính',
    proceedToPayment: 'Tiến hành thanh toán',
    checkoutTitle: 'Thanh toán',
    orderSummary: 'Tóm tắt đơn hàng',
    total: 'Tổng cộng',
    payWith: 'Thanh toán qua',
    securePay: 'Thanh toán an toàn qua VNPay',
    demoNotice: 'Đây là bản demo — ở môi trường thực tế, bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất đơn hàng.',
    quantity: 'Số lượng',
    qty: 'SL',
    buyNow: 'Mua ngay qua',
    toastAdded: (name) => `Đã thêm "${name}" vào giỏ`,
    processing: 'Đang chuyển đến VNPay…',
    orderPlaced: 'Đặt hàng thành công (demo)',
    emptyCartCheckout: 'Giỏ hàng trống — hãy thêm sản phẩm trước!',
    productDesc: (base, variant) => `${base}, phiên bản ${variant}. Sản phẩm chính hãng Kamitsubaki Studio, chất liệu cao cấp, in ấn sắc nét, đóng gói cẩn thận trước khi giao đến bạn.`,
  },
};

const PAGE_SIZE = 12;
const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

// ============================================================================
// CATALOG — generated from a small set of real product lines × variants, so
// the grid + pagination has enough substance to actually page through.
// Each template now carries its own base name + variant labels PER LANGUAGE
// (en / ja / vi — same codes as T above), so switching the site language
// also translates the storefront's product names, not just the UI chrome.
// `category`/`price`/variant COUNT stay language-independent — only the
// display strings differ — which keeps product ids (`sp-{ti}-{vi}`) stable
// across a language switch, so the cart never loses track of an item.
// ============================================================================
const TEMPLATES = [
  {
    category: 'ao', price: 549000,
    names: {
      en: { base: 'Isekaijoucho Hoodie', variants: ['Black', 'White', 'Grey'] },
      ja: { base: 'Isekaijoucho パーカー', variants: ['ブラック', 'ホワイト', 'グレー'] },
      vi: { base: 'Áo Hoodie Isekaijoucho', variants: ['Đen', 'Trắng', 'Xám'] },
    },
  },
  {
    category: 'ao', price: 289000,
    names: {
      en: { base: 'Kamitsubaki City T-Shirt', variants: ['Black', 'White', 'Red'] },
      ja: { base: 'Kamitsubaki City Tシャツ', variants: ['ブラック', 'ホワイト', 'レッド'] },
      vi: { base: 'Áo Thun Kamitsubaki City', variants: ['Đen', 'Trắng', 'Đỏ'] },
    },
  },
  {
    category: 'ao', price: 659000,
    names: {
      en: { base: 'V.W.P Windbreaker Jacket', variants: ['Black', 'Navy'] },
      ja: { base: 'V.W.P ウィンドブレーカー', variants: ['ブラック', 'ネイビー'] },
      vi: { base: 'Áo Khoác Windbreaker V.W.P', variants: ['Đen', 'Navy'] },
    },
  },
  {
    category: 'phukien', price: 89000,
    names: {
      en: { base: 'Isekaijoucho Acrylic Keychain', variants: ['Ver.1', 'Ver.2', 'Ver.3'] },
      ja: { base: 'Isekaijoucho アクリルキーホルダー', variants: ['Ver.1', 'Ver.2', 'Ver.3'] },
      vi: { base: 'Móc Khóa Acrylic Isekaijoucho', variants: ['Ver.1', 'Ver.2', 'Ver.3'] },
    },
  },
  {
    category: 'phukien', price: 159000,
    names: {
      en: { base: 'Mini Character Standee', variants: ['KAF', 'RIM', 'Haru', 'Sekai'] },
      ja: { base: 'ミニキャラクタースタンディー', variants: ['KAF', 'RIM', 'Haru', 'Sekai'] },
      vi: { base: 'Standee Mini Nhân Vật', variants: ['KAF', 'RIM', 'Haru', 'Sekai'] },
    },
  },
  {
    category: 'phukien', price: 65000,
    names: {
      en: { base: 'Pin Badge Set', variants: ['Set A', 'Set B'] },
      ja: { base: 'ピンバッジセット', variants: ['セットA', 'セットB'] },
      vi: { base: 'Bộ Huy Hiệu Cài Áo', variants: ['Bộ A', 'Bộ B'] },
    },
  },
  {
    category: 'vpp', price: 75000,
    names: {
      en: { base: 'Kamitsubaki Studio Notebook', variants: ['Red Cover', 'Black Cover'] },
      ja: { base: '神椿スタジオ ノート', variants: ['赤カバー', '黒カバー'] },
      vi: { base: 'Sổ Tay Kamitsubaki Studio', variants: ['Bìa Đỏ', 'Bìa Đen'] },
    },
  },
  {
    category: 'vpp', price: 99000,
    names: {
      en: { base: 'Character Print Poster', variants: ['A2 Size', 'A3 Size'] },
      ja: { base: 'キャラクタープリントポスター', variants: ['A2サイズ', 'A3サイズ'] },
      vi: { base: 'Poster In Nhân Vật', variants: ['Khổ A2', 'Khổ A3'] },
    },
  },
  {
    category: 'vpp', price: 55000,
    names: {
      en: { base: 'Collectible Postcard Set', variants: ['Set 1', 'Set 2'] },
      ja: { base: 'コレクタブルポストカードセット', variants: ['セット1', 'セット2'] },
      vi: { base: 'Bộ Postcard Sưu Tập', variants: ['Set 1', 'Set 2'] },
    },
  },
  {
    category: 'khac', price: 139000,
    names: {
      en: { base: 'Kamitsubaki City Mug', variants: ['White', 'Black'] },
      ja: { base: '神椿市 マグカップ', variants: ['ホワイト', 'ブラック'] },
      vi: { base: 'Ly Sứ 神椿市', variants: ['Trắng', 'Đen'] },
    },
  },
  {
    category: 'khac', price: 149000,
    names: {
      en: { base: 'Canvas Tote Bag', variants: ['Beige', 'Black'] },
      ja: { base: 'キャンバストートバッグ', variants: ['ベージュ', 'ブラック'] },
      vi: { base: 'Túi Tote Vải Canvas', variants: ['Be', 'Đen'] },
    },
  },
  {
    category: 'khac', price: 279000,
    names: {
      en: { base: 'Character Body Pillow', variants: ['35cm', '45cm'] },
      ja: { base: 'キャラクター抱き枕', variants: ['35cm', '45cm'] },
      vi: { base: 'Gối Ôm Nhân Vật', variants: ['35cm', '45cm'] },
    },
  },
];

// Builds the product list for a given language code. Falls back to English
// names/description if a template or locale is somehow missing a translation,
// so the shop never renders blank/undefined product text.
function buildCatalog(lang) {
  const tr = T[lang] || T.en;
  const list = [];
  let counter = 0;
  TEMPLATES.forEach((tpl, ti) => {
    const names = tpl.names[lang] || tpl.names.en;
    names.variants.forEach((v, vi) => {
      counter += 1;
      list.push({
        id: `sp-${ti}-${vi}`,
        name: `${names.base} — ${v}`,
        category: tpl.category,
        price: tpl.price,
        image: IMAGES[counter % IMAGES.length],
        description: tr.productDesc(names.base, v),
      });
    });
  });
  return list;
}

// ============================================================================
// VNPAY CHECKOUT
// VNPay requires the payment request to be signed server-side (HMAC-SHA512
// over the vnp_* params using your Merchant TerminalId + HashSecret) — that
// must happen on a backend, never in browser JS, or the HashSecret leaks.
// This function is the frontend half, already shaped to call a future
// endpoint and redirect to the payment URL VNPay returns. Swap the mock body
// for the real fetch() once that endpoint exists; nothing else changes.
// ============================================================================
async function payWithVNPay({ orderId, amount, orderInfo }) {
  // --- Real integration would look like: ---
  // const res = await fetch('/api/vnpay/create-payment', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ orderId, amount, orderInfo, returnUrl: window.location.origin + '/vnpay/return' }),
  // });
  // const { paymentUrl } = await res.json();
  // window.location.href = paymentUrl; // → VNPay hosted checkout page

  // --- Demo mode (no backend wired up yet) ---
  await new Promise((r) => setTimeout(r, 900));
  return { demo: true };
}

// ============================================================================
// LAZY IMAGE — only fetches once scrolled near-into-view (IntersectionObserver)
// on top of native loading="lazy", with a shimmering placeholder until loaded.
// ============================================================================
function LazyImage({ src, alt, className = '' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }),
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ background: '#111117' }}>
      {!loaded && <div className="absolute inset-0 shop-shimmer" />}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}

function ProductCard({ product, t, onOpen, onAdd }) {
  return (
    <div className="group rounded-2xl overflow-hidden flex flex-col" style={{ background: 'rgba(16,16,22,0.75)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <button onClick={() => onOpen(product.id)} className="relative aspect-square overflow-hidden text-left w-full">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.06]">
          <LazyImage src={product.image} alt={product.name} className="w-full h-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
            className="block w-full text-center text-xs font-bold tracking-widest uppercase py-2.5 rounded-lg text-white bg-red-600 hover:bg-red-500 transition-colors"
          >
            {t.addToCart}
          </span>
        </div>
      </button>
      <button onClick={() => onOpen(product.id)} className="p-3 flex-1 flex flex-col gap-1 text-left">
        <p className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2">{product.name}</p>
        <span className="mt-auto text-sm font-bold text-red-400 pt-1">{formatVND(product.price)}</span>
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: 'rgba(16,16,22,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="aspect-square shop-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-4/5 rounded shop-shimmer" />
        <div className="h-3 w-1/3 rounded shop-shimmer" />
      </div>
    </div>
  );
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 1;
  const range = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) range.push(i);
  const list = [1];
  if (range[0] > 2) list.push('…');
  list.push(...range);
  if (range[range.length - 1] < total - 1) list.push('…');
  list.push(total);
  return list;
}

function Pagination({ page, totalPages, onGo }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
      <button disabled={page === 1} onClick={() => onGo(page - 1)} className="shop-page-btn disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronLeft size={14} />
      </button>
      {buildPageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-1.5 text-white/30 text-xs">…</span>
        ) : (
          <button key={p} onClick={() => onGo(p)} className={`shop-page-btn ${p === page ? 'active' : ''}`}>{p}</button>
        )
      )}
      <button disabled={page === totalPages} onClick={() => onGo(page + 1)} className="shop-page-btn disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function LanguageMenu({ lang, onChange }) {
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="shop-lang-btn">
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden z-50" style={{ background: '#0d0d13', border: '1px solid rgba(255,255,255,0.15)' }}>
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { onChange(l.code); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/10 text-left transition-colors"
                style={{ color: l.code === lang ? '#ff6b6b' : '#fff' }}
              >
                <span>{l.flag}</span>{l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// CART DRAWER — real add/remove/quantity cart, persisted to localStorage,
// with a dedicated "Proceed to Payment" action into the Checkout view.
// ============================================================================
function CartDrawer({ open, onClose, lines, t, onQtyChange, onRemove, onCheckout }) {
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="font-cinematic text-lg">{t.cartTitle}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {lines.length === 0 ? (
            <p className="text-sm text-white/40 text-center pt-10">{t.cartEmpty}</p>
          ) : (
            lines.map((l) => (
              <div key={l.productId} className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <LazyImage src={l.product.image} alt={l.product.name} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold line-clamp-2 mb-1">{l.product.name}</p>
                  <p className="text-xs text-red-400 font-bold mb-1.5">{formatVND(l.product.price)}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-md overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                      <button onClick={() => onQtyChange(l.productId, l.qty - 1)} className="p-1 hover:bg-white/10"><Minus size={11} /></button>
                      <span className="w-6 text-center text-xs">{l.qty}</span>
                      <button onClick={() => onQtyChange(l.productId, l.qty + 1)} className="p-1 hover:bg-white/10"><Plus size={11} /></button>
                    </div>
                    <button onClick={() => onRemove(l.productId)} className="text-white/30 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
                <span className="text-xs font-bold whitespace-nowrap">{formatVND(l.product.price * l.qty)}</span>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">{t.subtotal}</span>
              <span className="font-bold text-lg text-red-400">{formatVND(subtotal)}</span>
            </div>
            <button onClick={onCheckout} className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-colors">
              {t.proceedToPayment}
            </button>
            <button onClick={onClose} className="w-full text-xs uppercase tracking-widest text-white/40 hover:text-white text-center py-1">{t.continueShopping}</button>
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================================
// PRODUCT DETAIL — its own "page" via the ?product= query param, so it's a
// real, shareable/bookmarkable URL without needing a separate router entry.
// ============================================================================
function ProductDetail({ product, t, onBack, onAdd }) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(product.image);

  useEffect(() => {
    document.title = `${product.name} · Kamitsubaki Shop`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImg(product.image);
    setQty(1);
  }, [product.id]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={onBack} className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-6 flex items-center gap-1">
        <ChevronLeft size={14} /> {t.backToShop}
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="rounded-2xl overflow-hidden aspect-square mb-3" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <LazyImage src={activeImg} alt={product.name} className="w-full h-full" />
          </div>
          <div className="flex gap-2">
            {IMAGES.map((img) => (
              <button
                key={img}
                onClick={() => setActiveImg(img)}
                className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                style={{ border: img === activeImg ? '2px solid #ff3d4d' : '1px solid rgba(255,255,255,0.15)' }}
              >
                <LazyImage src={img} alt="" className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-[11px] tracking-[0.3em] uppercase text-red-400/80 mb-2">{t.categories[product.category]}</p>
          <h1 className="font-cinematic text-2xl sm:text-3xl font-bold mb-3">{product.name}</h1>
          <p className="text-2xl font-bold text-red-400 mb-4">{formatVND(product.price)}</p>
          <p className="text-sm text-white/60 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs uppercase tracking-wider text-white/40">{t.quantity}</span>
            <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2 hover:bg-white/10"><Minus size={13} /></button>
              <span className="w-9 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-2 hover:bg-white/10"><Plus size={13} /></button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-auto">
            <button
              onClick={() => onAdd(product, qty)}
              className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {t.addToCart}
            </button>
            <p className="flex items-center gap-1.5 text-[11px] text-white/35 justify-center pt-1">
              <ShieldCheck size={12} /> {t.securePay}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHECKOUT — reached only via "Proceed to Payment" in the cart. Its own
// ?view=checkout URL, so browser Back rolls it back one step, not to Home.
// ============================================================================
function Checkout({ lines, t, onBack, onPlaced }) {
  const [payLoading, setPayLoading] = useState(false);
  const [placed, setPlaced] = useState(false);
  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  useEffect(() => { document.title = `${t.checkoutTitle} · Kamitsubaki Shop`; window.scrollTo({ top: 0 }); }, []);

  const handlePay = async () => {
    setPayLoading(true);
    await payWithVNPay({
      orderId: `ORDER-${Date.now()}`,
      amount: total,
      orderInfo: lines.map((l) => `${l.product.name} x${l.qty}`).join(', '),
    });
    setPayLoading(false);
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="shop-vnpay-badge inline-block mb-4">VNPAY</p>
        <h2 className="font-cinematic text-2xl mb-3">{t.orderPlaced}</h2>
        <p className="text-white/50 text-sm mb-8">{t.demoNotice}</p>
        <button onClick={onPlaced} className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-500">{t.continueShopping}</button>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-white/50 text-sm mb-6">{t.emptyCartCheckout}</p>
        <button onClick={onBack} className="shop-chip active">{t.continueShopping}</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={onBack} className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-6 flex items-center gap-1">
        <ChevronLeft size={14} /> {t.backToShop}
      </button>
      <h1 className="font-cinematic text-2xl sm:text-3xl font-bold mb-6">{t.checkoutTitle}</h1>

      <div className="rounded-2xl p-5 mb-6 space-y-4" style={{ background: 'rgba(16,16,22,0.75)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 className="text-xs uppercase tracking-widest text-white/40">{t.orderSummary}</h2>
        {lines.map((l) => (
          <div key={l.productId} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <LazyImage src={l.product.image} alt={l.product.name} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold line-clamp-1">{l.product.name}</p>
              <p className="text-[11px] text-white/40">{t.qty}: {l.qty}</p>
            </div>
            <span className="text-xs font-bold">{formatVND(l.product.price * l.qty)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="text-sm font-semibold">{t.total}</span>
          <span className="text-xl font-bold text-red-400">{formatVND(total)}</span>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={payLoading}
        className="w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {payLoading ? t.processing : (<>{t.payWith} <span className="shop-vnpay-badge">VNPAY</span></>)}
      </button>
      <p className="flex items-center gap-1.5 text-[11px] text-white/35 justify-center pt-3">
        <ShieldCheck size={12} /> {t.securePay}
      </p>
    </div>
  );
}

const CATEGORY_IDS = ['all', 'ao', 'phukien', 'vpp', 'khac'];
const CART_STORAGE_KEY = 'kamitsubaki_cart';
const LANG_STORAGE_KEY = 'kamitsubaki_lang';

export default function Services() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const activeCategory = searchParams.get('cat') || 'all';
  const productId = searchParams.get('product');
  const checkoutView = searchParams.get('view') === 'checkout';

  // Language: URL ?lang= (so other pages can deep-link into a specific
  // language) takes priority, falling back to the saved preference, then
  // English as the base language.
  const [lang, setLangState] = useState(
    () => searchParams.get('lang') || localStorage.getItem(LANG_STORAGE_KEY) || 'en'
  );
  const t = T[lang] || T.en;

  // Catalog is derived from TEMPLATES for the current language. Product
  // ids (`sp-{ti}-{vi}`) stay identical across languages, so this only
  // needs to be recomputed — the cart (which stores ids, not full product
  // objects) keeps working correctly when the language changes mid-session.
  const PRODUCTS = useMemo(() => buildCatalog(lang), [lang]);

  useEffect(() => { localStorage.setItem(LANG_STORAGE_KEY, lang); }, [lang]);
  useEffect(() => {
    const urlLang = searchParams.get('lang');
    if (urlLang && urlLang !== lang && T[urlLang]) setLangState(urlLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('lang')]);

  const changeLang = (code) => {
    setLangState(code);
    const next = new URLSearchParams(searchParams);
    next.set('lang', code);
    setSearchParams(next, { replace: true }); // language toggle shouldn't clutter the back stack
  };

  // Cart — persisted so it survives a refresh.
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)); }, [cartItems]);
  const [cartOpen, setCartOpen] = useState(false);

  const cartLines = useMemo(
    () => cartItems.map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.productId) })).filter((l) => l.product),
    [cartItems, PRODUCTS]
  );
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);

  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2200);
  };

  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty }; return copy; }
      return [...prev, { productId: product.id, qty }];
    });
    showToast(t.toastAdded(product.name));
  };
  const updateQty = (productId, qty) => {
    setCartItems((prev) => (qty <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, qty } : i))));
  };
  const removeFromCart = (productId) => setCartItems((prev) => prev.filter((i) => i.productId !== productId));

  // Listing data
  const filteredAll = useMemo(() => PRODUCTS.filter((p) => activeCategory === 'all' || p.category === activeCategory), [activeCategory, PRODUCTS]);
  const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageItems, setPageItems] = useState([]);

  // Simulated async page fetch — swap this timeout for a real API call
  // (e.g. GET /api/products?page=&category=) later; the loading-state
  // handling around it already works exactly the way it would for a real
  // network request.
  useEffect(() => {
    if (productId || checkoutView) return;
    setLoadingPage(true);
    const tmr = setTimeout(() => {
      const start = (safePage - 1) * PAGE_SIZE;
      setPageItems(filteredAll.slice(start, start + PAGE_SIZE));
      setLoadingPage(false);
    }, 380);
    return () => clearTimeout(tmr);
  }, [safePage, activeCategory, productId, checkoutView, filteredAll]);

  useEffect(() => {
    if (!productId && !checkoutView) document.title = 'Cửa hàng · Kamitsubaki Studio';
  }, [productId, checkoutView]);

  // --------------------------------------------------------------------
  // NAVIGATION — the fix: back always rolls back ONE step within the shop
  // (product → grid, checkout → cart's grid, etc.) instead of jumping to
  // Home. Only at the shop's top level does "back" mean Home.
  // --------------------------------------------------------------------
  const inSubView = Boolean(productId) || checkoutView;
  const handleBack = () => {
    if (inSubView) {
      if (location.key !== 'default') {
        navigate(-1);
      } else {
        // deep-linked straight into a sub-view with no in-app history yet
        const next = new URLSearchParams(searchParams);
        next.delete('product'); next.delete('view');
        setSearchParams(next);
      }
    } else {
      navigate('/');
    }
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'all') next.delete('cat'); else next.set('cat', id);
    next.set('page', '1');
    setSearchParams(next);
  };
  const openProduct = (id) => {
    const next = new URLSearchParams(searchParams);
    next.delete('view');
    next.set('product', id);
    setSearchParams(next);
  };
  const goCheckout = () => {
    setCartOpen(false);
    const next = new URLSearchParams(searchParams);
    next.delete('product');
    next.set('view', 'checkout');
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  };
  const backToShopRoot = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('product'); next.delete('view');
    setSearchParams(next);
  };

  const activeProduct = productId ? PRODUCTS.find((p) => p.id === productId) : null;

  return (
    <div className="min-h-screen text-white" style={{ background: 'radial-gradient(circle at 50% -10%, rgba(193,18,31,0.22), transparent 55%), #050506' }}>
      <style>{`
        .font-cinematic { font-family: 'Cinzel', serif; }
        @keyframes shop-pop { 0% { opacity:0; transform: translateY(10px) scale(0.97);} 100% { opacity:1; transform: translateY(0) scale(1);} }
        @keyframes shop-shimmer-move { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .shop-shimmer { background: linear-gradient(100deg, #14141c 20%, #1c1c26 40%, #14141c 60%); background-size: 200% 100%; animation: shop-shimmer-move 1.4s infinite linear; }
        .shop-chip { padding: 7px 16px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.03em; white-space: nowrap; cursor: pointer; transition: all 0.2s ease; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.04); }
        .shop-chip.active { background: #c1121f; border-color: #c1121f; color: #fff; }
        .shop-chip:hover:not(.active) { border-color: rgba(255,255,255,0.4); color: #fff; }
        .shop-page-btn { min-width: 30px; height: 30px; padding: 0 6px; border-radius: 8px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; transition: all 0.15s ease; }
        .shop-page-btn.active { background: #c1121f; border-color: #c1121f; color: #fff; }
        .shop-page-btn:hover:not(.active):not(:disabled) { border-color: rgba(255,255,255,0.4); color: #fff; }
        .shop-vnpay-badge { display: inline-block; padding: 2px 7px; border-radius: 5px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; background: #ffffff; color: #003a70; }
        .shop-lang-btn { display: flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); cursor: pointer; }
        .shop-lang-btn:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
      `}</style>

      <header className="sticky top-0 z-30 backdrop-blur-md" style={{ background: 'rgba(5,5,8,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Link to="/" className="font-cinematic text-lg sm:text-xl tracking-[0.15em] text-white hover:text-red-400 transition-colors flex-shrink-0">
            神椿 <span className="text-red-500">SHOP</span>
          </Link>

          <button onClick={handleBack} className="hidden sm:flex items-center gap-1 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={13} /> {inSubView ? t.backToShop : t.backHome}
          </button>

          <div className="flex items-center gap-3">
            <LanguageMenu lang={lang} onChange={changeLang} />
            <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-1.5 text-sm">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
        {/* mobile back row */}
        <div className="sm:hidden px-4 pb-3 -mt-1">
          <button onClick={handleBack} className="flex items-center gap-1 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={13} /> {inSubView ? t.backToShop : t.backHome}
          </button>
        </div>
      </header>

      {checkoutView ? (
        <Checkout lines={cartLines} t={t} onBack={handleBack} onPlaced={() => { setCartItems([]); backToShopRoot(); }} />
      ) : activeProduct ? (
        <ProductDetail product={activeProduct} t={t} onBack={handleBack} onAdd={(p, qty) => { addToCart(p, qty); setCartOpen(true); }} />
      ) : (
        <>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-6 text-center">
            <p className="text-[11px] tracking-[0.35em] uppercase text-red-400/80 mb-3">{t.heroEyebrow}</p>
            <h1 className="font-cinematic text-3xl sm:text-5xl font-bold tracking-wide mb-3">{t.heroTitle}</h1>
            <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto">{t.heroSub}</p>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {CATEGORY_IDS.map((id) => (
                <button key={id} onClick={() => setCategory(id)} className={`shop-chip ${activeCategory === id ? 'active' : ''}`}>{t.categories[id]}</button>
              ))}
            </div>
            <p className="text-xs text-white/40">{t.pageInfo(safePage, totalPages, filteredAll.length)}</p>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {loadingPage
                ? Array.from({ length: PAGE_SIZE }, (_, i) => <SkeletonCard key={i} />)
                : pageItems.map((p) => <ProductCard key={p.id} product={p} t={t} onOpen={openProduct} onAdd={addToCart} />)}
            </div>
            {!loadingPage && pageItems.length === 0 && (
              <div className="text-center py-24 text-white/40 text-sm">{t.emptyCategory}</div>
            )}
            <Pagination page={safePage} totalPages={totalPages} onGo={goToPage} />
          </main>
        </>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cartLines}
        t={t}
        onQtyChange={updateQty}
        onRemove={removeFromCart}
        onCheckout={goCheckout}
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white shadow-2xl" style={{ background: 'rgba(15,15,20,0.96)', border: '1px solid rgba(255,255,255,0.15)', animation: 'shop-pop 0.25s ease' }}>
          <ShoppingBag size={16} className="text-red-400" />
          <span className="max-w-[220px] truncate">{toast}</span>
          <button onClick={() => setToast(null)} className="text-white/40 hover:text-white"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
