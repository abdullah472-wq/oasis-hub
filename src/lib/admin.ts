const enableAdminPanel = import.meta.env.VITE_ENABLE_ADMIN_PANEL === "true";
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD?.trim();

export const isAdminEnabled = enableAdminPanel && Boolean(adminPassword);

export const validateAdminPassword = (value: string): boolean => {
  if (!isAdminEnabled || !adminPassword) {
    return false;
  }

  return value === adminPassword;
};
