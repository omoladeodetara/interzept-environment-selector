/**
 * Custom fetch wrapper for Orval-generated API client
 * 
 * This mutator allows you to customize all fetch requests:
 * - Add authentication headers
 * - Handle errors consistently
 * - Add request/response interceptors
 */

export const customFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: response.statusText 
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

export default customFetch;
