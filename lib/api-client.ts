import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
}

export class ApiClient {
  private static getAuthToken(): string | null {
    return Cookies.get('auth_token') || null;
  }

  private static getHeaders(authenticated: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authenticated) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  static async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { authenticated = true, ...requestOptions } = options;
    
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(authenticated);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        headers: {
          ...headers,
          ...requestOptions.headers,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        Cookies.remove('auth_token');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('API Response Text:', responseText);
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return JSON.parse(responseText);
        } else {
          return responseText as T;
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON response: ${parseError}`);
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async get<T>(endpoint: string, authenticated: boolean = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      authenticated,
    });
  }

  static async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    authenticated: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      authenticated,
    });
  }

  static async put<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    authenticated: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      authenticated,
    });
  }

  static async delete<T>(
    endpoint: string,
    authenticated: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      authenticated,
    });
  }

  // GraphQL specific method
  static async graphql<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    interface GraphQLResponse<T> {
      data?: T;
      errors?: Array<{
        message: string;
        extensions?: {
          code?: string;
          field?: string;
        };
      }>;
    }

    try {
      const mappedVariables = ApiClient.mapContentTypeVariables(variables);
      console.log('GraphQL Request:', { query, variables: mappedVariables });
      const response = await ApiClient.post<GraphQLResponse<T>>(
        '/admin/query',
        {
          query,
          variables: mappedVariables,
        },
        true
      );

      // GraphQLエラーの処理
      if (response.errors && response.errors.length > 0) {
        const errorMessage = response.errors
          .map(error => error.message)
          .join(', ');
        throw new Error(`GraphQL Error: ${errorMessage}`);
      }

      if (!response.data) {
        throw new Error('No data returned from GraphQL query');
      }

      return response.data;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      
      // より具体的なエラーメッセージを生成
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('認証が必要です。ログインしてください。');
        } else if (error.message.includes('403')) {
          throw new Error('このアクションを実行する権限がありません。');
        } else if (error.message.includes('404')) {
          throw new Error('リクエストされたリソースが見つかりません。');
        } else if (error.message.includes('500')) {
          throw new Error('サーバーエラーが発生しました。しばらく待ってから再試行してください。');
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          throw new Error('ネットワークエラーです。インターネット接続を確認してください。');
        }
      }
      
      throw error;
    }
  }

  private static mapContentTypeVariables(variables: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!variables) return variables;
    
    const mapped = JSON.parse(JSON.stringify(variables)); // Deep clone
    
    // Recursively clean UUID fields
    const mapAndCleanValues = (obj: unknown): void => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach(mapAndCleanValues);
        } else {
          const record = obj as Record<string, unknown>;
          // Convert empty strings to null for UUID fields
          const uuidFields = ['codeCategoryId', 'parentId'];
          uuidFields.forEach(field => {
            if (record[field] === '') {
              record[field] = null;
            }
          });
          
          Object.values(record).forEach(mapAndCleanValues);
        }
      }
    };
    
    mapAndCleanValues(mapped);
    return mapped;
  }
}