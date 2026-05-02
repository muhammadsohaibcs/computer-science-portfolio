/**
 * pagination.js
 * Small helper to normalize paging params and create meta object
 */

function parsePagination(query = {}, defaultLimit = 20, maxLimit = 1000) {
  const page = Math.max(1, parseInt(query.page || 1, 10));
  let limit = parseInt(query.limit || defaultLimit, 10);
  if (isNaN(limit) || limit <= 0) limit = defaultLimit;
  limit = Math.min(limit, maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function metaFor(total, page, limit) {
  const pages = Math.ceil(total / limit);
  return { total, page, pages, limit };
}

module.exports = { parsePagination, metaFor };