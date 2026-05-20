export const getPaginationOptions = (page = 1, limit = 20) => {
  const normalizedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const normalizedLimit = Math.min(
    Math.max(Number.parseInt(limit, 10) || 20, 1),
    100
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    from: (normalizedPage - 1) * normalizedLimit,
    to: normalizedPage * normalizedLimit - 1,
  };
};

export const buildPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
};

export const buildListResponse = (data, count = null) => {
  return {
    success: true,
    data,
    count,
  };
};
