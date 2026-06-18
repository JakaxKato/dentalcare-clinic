// Escape regex metacharacters to prevent ReDoS and regex injection
// when user-supplied strings are used in MongoDB $regex queries.
const escapeRegex = (input) =>
  String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { escapeRegex };
