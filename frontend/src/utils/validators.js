export const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const isRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field check
  const re = /^\+?[0-9\s-]{10,15}$/;
  return re.test(phone);
};
