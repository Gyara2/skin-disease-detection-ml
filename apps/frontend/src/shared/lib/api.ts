import { ENV } from '@/shared/config/env';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');
const getRequestUrl = (path: string) => `${normalizeBaseUrl(ENV.API_URL)}${path}`;

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const apiRequest = async <TResponse, TBody = undefined>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH',
  errorMessage: string,
  body?: TBody,
): Promise<TResponse> => {
  const response = await fetch(getRequestUrl(path), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return parseResponse<TResponse>(response);
};

export const apiGet = async <T>(
  path: string,
  errorMessage = 'No se pudo completar la peticion',
): Promise<T> => {
  return apiRequest<T>(path, 'GET', errorMessage);
};

export const apiPost = async <TResponse, TBody>(
  path: string,
  body: TBody,
  errorMessage = 'No se pudo completar la peticion',
): Promise<TResponse> => {
  return apiRequest<TResponse, TBody>(path, 'POST', errorMessage, body);
};

export const apiPatch = async <TResponse, TBody>(
  path: string,
  body: TBody,
  errorMessage = 'No se pudo completar la peticion',
): Promise<TResponse> => {
  return apiRequest<TResponse, TBody>(path, 'PATCH', errorMessage, body);
};
