const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: [true, 'Description is required'] },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    duration: { type: Number, default: 30, min: 5 },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.pre('validate', async function (next) {
  if (this.title && (this.isModified('title') || !this.slug)) {
    let base = slugify(this.title, { lower: true, strict: true });
    let candidate = base;
    let suffix = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await mongoose.model('Service').findOne({ slug: candidate, _id: { $ne: this._id } });
      if (!existing) break;
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    this.slug = candidate;
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
