

export const parseWindowsPath = (path: string | undefined): string => {
  return path?.split(`\\`).join(`/`) || '';
}