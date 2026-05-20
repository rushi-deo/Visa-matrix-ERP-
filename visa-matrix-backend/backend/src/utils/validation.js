export const removeUndefined = (payload) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
};
