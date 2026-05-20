export const sanitizeSearchTerm = (value) => {
  return String(value || "")
    .trim()
    .replace(/[%(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const buildIlikeOrQuery = (columns, searchTerm) => {
  return columns.map((column) => `${column}.ilike.%${searchTerm}%`).join(",");
};
