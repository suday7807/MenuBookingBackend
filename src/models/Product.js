const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    ingredients: [{ type: String, trim: true }],
    category: { type: String, trim: true, default: 'Mains' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
