export const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

// Only use emulators when truly running on localhost AND explicitly opted in.
export const useEmulators =
  isLocalhost && (process.env.NEXT_PUBLIC_USE_EMULATORS ?? 'false') === 'true';
