const parseBooleanEnv = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true';
};

export const ENV = {
  USE_MOCK: parseBooleanEnv(import.meta.env.VITE_USE_MOCK, true),
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
};
