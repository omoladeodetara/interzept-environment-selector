import { PaymentRequiredError } from './payment-handler';
import { PaymentRequiredResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiOptions extends RequestInit {
  onPaymentRequired?: (response: PaymentRequiredResponse) => void;
}

/**
 * API Client with HTTP 402 handling
 */
class ApiClient {
  private getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  /**
   * Make an API request with automatic 402 handling
   */
  async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const { onPaymentRequired, ...fetchOptions } = options;

    const url = `${this.getBaseUrl()}${endpoint}`;
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    // Handle HTTP 402 Payment Required
    if (response.status === 402) {
      const paymentData: PaymentRequiredResponse = await response.json();
      
      if (onPaymentRequired) {
        onPaymentRequired(paymentData);
      }
      
      throw new PaymentRequiredError(paymentData);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };
