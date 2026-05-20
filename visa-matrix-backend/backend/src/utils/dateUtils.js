export const nowIso = () => new Date().toISOString();

export const addDays = (dateValue, days) => {
  const baseDate = new Date(dateValue);
  baseDate.setUTCDate(baseDate.getUTCDate() + days);
  return baseDate.toISOString();
};

export const toDateOnly = (dateValue) => {
  return new Date(dateValue).toISOString().slice(0, 10);
};
