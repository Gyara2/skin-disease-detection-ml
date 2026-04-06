import { ENV } from '@/shared/config/env';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

export const apiGet = async <T>(
  path: string,
  errorMessage = 'No se pudo completar la peticion',
): Promise<T> => {
  const response = await fetch(`${normalizeBaseUrl(ENV.API_URL)}${path}`);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
};
