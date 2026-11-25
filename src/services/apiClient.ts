import { API_CONFIG } from '../config/apiConfig';
import { BackendMode } from '../types';

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
}

class ApiClient {
  private baseUrl: string = API_CONFIG.DEFAULT_BASE_URL;
  private mode: BackendMode = API_CONFIG.DEFAULT_MODE;

  public configure(baseUrl: string, mode: BackendMode) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.mode = mode;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getMode(): BackendMode {
    return this.mode;
  }

  public async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { timeoutMs = API_CONFIG.TIMEOUT_MS, headers, ...rest } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const isFormData = rest.body instanceof FormData;
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...rest,
        signal: controller.signal,
        headers: isFormData
          ? headers
          : {
              'Content-Type': 'application/json',
              ...(headers || {}),
            },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `FastAPI Error (${response.status}): ${errorText || response.statusText}`
        );
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  public async checkHealth(): Promise<{ ok: boolean; latencyMs: number; message: string }> {
    const start = performance.now();
    if (this.mode === 'demo') {
      return {
        ok: true,
        latencyMs: 4,
        message: 'Running in Local Demo Simulation Mode (FastAPI endpoint standby)',
      };
    }

    try {
      await this.request(API_CONFIG.ENDPOINTS.HEALTH, { method: 'GET', timeoutMs: 4000 });
      const latencyMs = Math.round(performance.now() - start);
      return {
        ok: true,
        latencyMs,
        message: `Connected to Python FastAPI at ${this.baseUrl}`,
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        ok: false,
        latencyMs,
        message:
          err instanceof Error
            ? `FastAPI unreachable (${err.message}). Switch to Demo Mode or start uvicorn.`
            : 'FastAPI backend unreachable.',
      };
    }
  }
}

export const apiClient = new ApiClient();
