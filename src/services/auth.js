import conf from "../conf/conf";

const tokenKey = "blogAccessToken";

async function request(path, options = {}) {
    const response = await fetch(`${conf.apiBaseUrl}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = Array.isArray(data.detail)
            ? data.detail.map((item) => item.msg).filter(Boolean).join("; ")
            : data.detail;
        const error = new Error(detail || "Request failed");
        error.code = response.status;
        throw error;
    }
    return data;
}

export class AuthService {
    async createAccount(data) {
        const session = await request("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
        localStorage.setItem(tokenKey, session.access_token);
        return session;
    }

    async login(data) {
        const session = await request("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
        localStorage.setItem(tokenKey, session.access_token);
        return session;
    }

    async getCurrentUser() {
        const token = localStorage.getItem(tokenKey);
        if (!token) return null;
        try {
            return await request("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        } catch {
            localStorage.removeItem(tokenKey);
            return null;
        }
    }

    async logout() {
        const token = localStorage.getItem(tokenKey);
        try {
            if (token) await request("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        } finally {
            localStorage.removeItem(tokenKey);
        }
        return true;
    }

    getToken() {
        return localStorage.getItem(tokenKey);
    }
}

export default new AuthService();
