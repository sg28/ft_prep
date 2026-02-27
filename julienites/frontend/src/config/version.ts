// Application version configuration
export const APP_VERSION = '0.1.1';
export const APP_NAME = 'Julienites';
export const APP_DESCRIPTION = 'Alumni Network';

// Version display configuration
export const getVersionDisplay = () => {
  return `${APP_DESCRIPTION} v${APP_VERSION}`;
};

export const getFullAppName = () => {
  return `${APP_NAME} ${APP_DESCRIPTION} v${APP_VERSION}`;
};

export const getCopyrightText = () => {
  const currentYear = new Date().getFullYear();
  return `© ${currentYear} ${APP_NAME} ${APP_DESCRIPTION} v${APP_VERSION}`;
};