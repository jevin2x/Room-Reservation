import axios, { AxiosError, type AxiosRequestConfig } from "axios";

import type {
  ApiResponse,
  Building,
  Reservation,
  Room,
  SectionAccount,
  SectionList,
} from "@/types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "/api/v1";

const TOKEN_KEY = "cpc_auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  if (config.data !== undefined && config.data !== null) {
    const headers = (config.headers ??= {});
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  try {
    const response = await client.request<T>(config);

    if (response.status === 204) {
      return { success: true, data: null } as T;
    }

    const payload = response.data as ApiResponse<T> | T;
    return ((payload as ApiResponse<T>)?.data ?? payload) as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<T>>;
      const data = axiosError.response?.data;

      if (axiosError.response?.status === 401) {
        setToken(null);
      }

      throw new ApiError(
        data?.message ??
          `Request failed with status ${axiosError.response?.status ?? 0}`,
        axiosError.response?.status ?? 0,
        data?.errors,
      );
    }

    throw error;
  }
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>({ method: "GET", url: path });
  },

  post<T>(path: string, data?: unknown): Promise<T> {
    return request<T>({ method: "POST", url: path, data });
  },

  put<T>(path: string, data?: unknown): Promise<T> {
    return request<T>({ method: "PUT", url: path, data });
  },

  patch<T>(path: string, data?: unknown): Promise<T> {
    return request<T>({ method: "PATCH", url: path, data });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>({ method: "DELETE", url: path });
  },
};

export const roomApi = {
  list(filters: Record<string, string | number | boolean> = {}): Promise<Room[]> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, String(value));
      }
    }
    const query = params.toString();
    return api.get<Room[]>(`/rooms${query ? `?${query}` : ""}`);
  },

  get(id: number): Promise<Room> {
    return api.get<Room>(`/rooms/${id}`);
  },

  availability(
    roomId: number,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<{ available: boolean }> {
    const params = new URLSearchParams({
      room_id: String(roomId),
      date,
      start_time: startTime,
      end_time: endTime,
    });
    return api.get<{ available: boolean }>(`/rooms/availability?${params}`);
  },
};

export type AuthUser = {
  id: number;
  program: string;
  year: number;
  section: string;
  section_label: string;
};

export const authApi = {
  register(data: {
    program: string;
    year: number;
    section: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ token: string; user: AuthUser }> {
    return api.post<{ token: string; user: AuthUser }>("/auth/register", data);
  },

  login(data: {
    program: string;
    year: number;
    section: string;
    password: string;
  }): Promise<{ token: string; user: AuthUser }> {
    return api.post<{ token: string; user: AuthUser }>("/auth/login", data);
  },

  logout(): Promise<null> {
    return api.post<null>("/auth/logout", {});
  },

  me(): Promise<AuthUser> {
    return api.get<AuthUser>("/auth/me");
  },
};

export const buildingApi = {
  list(): Promise<Building[]> {
    return api.get<Building[]>("/buildings");
  },
};

export const sectionApi = {
  list(): Promise<SectionList> {
    return api.get<SectionList>("/sections");
  },
};

export const adminApi = {
  listSections(): Promise<SectionAccount[]> {
    return api.get<SectionAccount[]>("/admin/sections");
  },

  changePassword(id: number, data: {
    password: string;
    password_confirmation: string;
  }): Promise<SectionAccount> {
    return api.put<SectionAccount>(`/admin/sections/${id}/password`, data);
  },
};

export const reservationApi = {
  list(filters: Record<string, string | number> = {}): Promise<Reservation[]> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, String(value));
      }
    }
    const query = params.toString();
    return api.get<Reservation[]>(`/reservations${query ? `?${query}` : ""}`);
  },

  create(data: {
    room_id: number | string;
    reservation_date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    notes?: string | null;
  }): Promise<Reservation> {
    return api.post<Reservation>("/reservations", data);
  },

  cancel(id: number): Promise<Reservation> {
    return api.post<Reservation>(`/reservations/${id}/cancel`);
  },
};