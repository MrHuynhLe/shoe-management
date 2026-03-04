export type AuthState = {
  token: string;
  role: string;
  permissions: string[];
};

const KEY = "auth";

export const authStorage = {
  get(): AuthState | null {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  },
  set(data: AuthState) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};