const enableAdminPanel = import.meta.env.VITE_ENABLE_ADMIN_PANEL === "true";

export const isAdminEnabled = enableAdminPanel;

export const validateAdminPassword = (value: string): boolean => {
  return isAdminEnabled && value.trim().length > 0;
};
