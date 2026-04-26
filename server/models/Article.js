const mongoose = require('mongoose');
const slugify = require('slugify');

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, required: [true, 'Content is required'] },
    excerpt: { type: String, default: '', trim: true },
    coverImage: { type: String, default: '' },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

articleSchema.pre('validate', function (next) {
  if (this.title && (this.isModified('title') || !this.slug)) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200).replace(/\s+\S*$/, '') + (this.content.length > 200 ? '...' : '');
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);
