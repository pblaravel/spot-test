/**
 * API клиент для взаимодействия с backend сервисами через api-gateway
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  lockedBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'TRADE';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  status: 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';
  filledQuantity: number;
  remainingQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'An error occurred',
          statusCode: response.status,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        statusCode: 500,
      };
    }
  }

  // Auth API
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/api/users/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/api/users/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/api/users/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Wallet API
  async getWallets(): Promise<ApiResponse<Wallet[]>> {
    return this.request('/api/wallet/wallets');
  }

  async getWallet(walletId: string): Promise<ApiResponse<Wallet>> {
    return this.request(`/api/wallet/wallets/${walletId}`);
  }

  async createWallet(currency: string): Promise<ApiResponse<Wallet>> {
    return this.request('/api/wallet/wallets', {
      method: 'POST',
      body: JSON.stringify({ currency }),
    });
  }

  async getTransactions(walletId?: string): Promise<ApiResponse<Transaction[]>> {
    const endpoint = walletId 
      ? `/api/wallet/wallets/${walletId}/transactions`
      : '/api/wallet/transactions';
    return this.request(endpoint);
  }

  async createTransaction(transactionData: {
    walletId: string;
    type: Transaction['type'];
    amount: number;
    currency: string;
    description?: string;
  }): Promise<ApiResponse<Transaction>> {
    return this.request('/api/wallet/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Trading API
  async getOrders(symbol?: string): Promise<ApiResponse<Order[]>> {
    const endpoint = symbol 
      ? `/api/trading/orders?symbol=${symbol}`
      : '/api/trading/orders';
    return this.request(endpoint);
  }

  async createOrder(orderData: {
    symbol: string;
    side: Order['side'];
    type: Order['type'];
    quantity: number;
    price?: number;
  }): Promise<ApiResponse<Order>> {
    return this.request('/api/trading/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
    return this.request(`/api/trading/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  async getOrderBook(symbol: string): Promise<ApiResponse<{
    symbol: string;
    bids: Array<[number, number]>; // [price, quantity]
    asks: Array<[number, number]>; // [price, quantity]
    lastUpdated: string;
  }>> {
    return this.request(`/api/trading/orderbook/${symbol}`);
  }

  async getMarketData(symbol?: string): Promise<ApiResponse<MarketData[]>> {
    const endpoint = symbol 
      ? `/api/trading/market-data/${symbol}`
      : '/api/trading/market-data';
    return this.request(endpoint);
  }

  // Analytics API
  async getPortfolioAnalytics(): Promise<ApiResponse<{
    totalValue: number;
    totalChange24h: number;
    totalChangePercent24h: number;
    assets: Array<{
      symbol: string;
      quantity: number;
      value: number;
      change24h: number;
    }>;
  }>> {
    return this.request('/api/analytics/portfolio');
  }

  async getTradingHistory(symbol?: string): Promise<ApiResponse<{
    trades: Array<{
      id: string;
      symbol: string;
      side: 'BUY' | 'SELL';
      quantity: number;
      price: number;
      timestamp: string;
    }>;
    totalTrades: number;
    totalVolume: number;
  }>> {
    const endpoint = symbol 
      ? `/api/analytics/trading-history?symbol=${symbol}`
      : '/api/analytics/trading-history';
    return this.request(endpoint);
  }

  // Notifications API
  async getNotifications(): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>>> {
    return this.request('/api/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.request('/api/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Market Maker API
  async getMarketMakerStatus(): Promise<ApiResponse<{
    isActive: boolean;
    symbols: string[];
    lastUpdate: string;
  }>> {
    return this.request('/api/market-maker/status');
  }

  async toggleMarketMaker(symbol: string, enabled: boolean): Promise<ApiResponse<void>> {
    return this.request('/api/market-maker/toggle', {
      method: 'POST',
      body: JSON.stringify({ symbol, enabled }),
    });
  }
}

// Создаем единственный экземпляр API клиента
export const apiClient = new ApiClient(); 