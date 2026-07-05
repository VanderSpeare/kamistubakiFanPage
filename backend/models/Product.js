const mongoose = require('mongoose');

// ============================================================================
// PRODUCT MODEL
// Mirrors the shape the frontend (productStore.js) already works with, so
// the API can return JSON that drops straight into the existing React code
// with minimal changes on that side.
// ============================================================================
const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // used as the public "id" (e.g. in ?product= URLs)
    name: { type: String, required: true },
    category: { type: String, enum: ['ao', 'phukien', 'vpp', 'khac'], required: true },
    price: { type: Number, required: true, min: 0 }, // VND
    image: { type: String, required: true },
    description: { type: String, default: '' },

    // SEO metadata — generated via Gemini in the admin panel, but always
    // editable, and stored as plain fields so they're easy to swap out later.
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    keywords: { type: [String], default: [] },

    brief: { type: String, default: '' }, // the admin's raw input to Gemini, kept so "Re-run" has something to regenerate from
    discontinued: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // which admin created/last edited it
  },
  { timestamps: true } // gives createdAt / updatedAt automatically
);

module.exports = mongoose.model('Product', productSchema);