const Product = require('../models/Product');

const PAGE_SIZE = 12;

function slugify(name) {
  return (
    'sp-' +
    name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip Vietnamese diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40)
  ) || `sp-${Date.now()}`;
}

async function uniqueSlug(base) {
  let slug = base;
  let n = 1;
  while (await Product.exists({ slug })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

// -------------------- PUBLIC --------------------

// GET /api/products?page=1&cat=ao
exports.listPublic = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const cat = req.query.cat;
    const filter = { discontinued: false };
    if (cat && cat !== 'all') filter.category = cat;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    res.json({ products, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)), total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:slug
exports.getBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, discontinued: false });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- ADMIN (protected) --------------------

// GET /api/admin/products?search=&status=all|active|discontinued
exports.listAdmin = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status === 'active') filter.discontinued = false;
    if (status === 'discontinued') filter.discontinued = true;
    if (search?.trim()) filter.name = { $regex: search.trim(), $options: 'i' };

    const products = await Product.find(filter).sort({ updatedAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/products
exports.create = async (req, res) => {
  try {
    const body = req.body;
    if (!body.name?.trim()) return res.status(400).json({ error: 'Name is required.' });

    const slug = await uniqueSlug(slugify(body.name));
    const product = await Product.create({
      slug,
      name: body.name,
      category: body.category,
      price: Number(body.price) || 0,
      image: body.image,
      description: body.description || '',
      seoTitle: body.seoTitle || '',
      seoDescription: body.seoDescription || '',
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      brief: body.brief || '',
      discontinued: Boolean(body.discontinued),
      createdBy: req.user?._id,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/admin/products/:id
exports.update = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      name: body.name,
      category: body.category,
      price: Number(body.price) || 0,
      image: body.image,
      description: body.description || '',
      seoTitle: body.seoTitle || '',
      seoDescription: body.seoDescription || '',
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      brief: body.brief || '',
      discontinued: Boolean(body.discontinued),
    };
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/products/:id/discontinue   body: { discontinued: true|false }
exports.setDiscontinued = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { discontinued: Boolean(req.body.discontinued) },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/products/:id
exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};