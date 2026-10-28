import conf from "../conf/conf";
import authService from "./auth";

async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = authService.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${conf.apiBaseUrl}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = Array.isArray(data.detail)
            ? data.detail.map((item) => item.msg).filter(Boolean).join("; ")
            : data.detail;
        throw new Error(detail || "Request failed");
    }
    return data;
}

const jsonRequest = (path, method, body) => request(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export class Service {
    emptyList() { return { documents: [] }; }

    async createPost(data) { return jsonRequest("/api/blogs", "POST", { ...data, tags: Array.isArray(data.tags) ? data.tags : String(data.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean) }); }
    async updatePost(slug, data) { return jsonRequest(`/api/blogs/${encodeURIComponent(slug)}`, "PUT", { ...data, tags: Array.isArray(data.tags) ? data.tags : String(data.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean) }); }
    async getPost(slug) { try { return await request(`/api/blogs/${encodeURIComponent(slug)}`); } catch { return false; } }
    recordPostView(slug) { return request(`/api/blogs/${encodeURIComponent(slug)}/view`, { method: "POST" }); }
    getLikeState(slug) { return request(`/api/blogs/${encodeURIComponent(slug)}/like`); }
    likePost(slug) { return request(`/api/blogs/${encodeURIComponent(slug)}/like`, { method: "PUT" }); }
    unlikePost(slug) { return request(`/api/blogs/${encodeURIComponent(slug)}/like`, { method: "DELETE" }); }
    async deletePost(slug) { try { await request(`/api/blogs/${encodeURIComponent(slug)}`, { method: "DELETE" }); return true; } catch { return false; } }

    async getPosts(params = {}) {
        const query = new URLSearchParams(params);
        return request(`/api/blogs${query.toString() ? `?${query}` : ""}`);
    }
    getUserPosts(userID) { return this.getPosts({ author: userID }); }
    getPublishedPosts({ author } = {}) { return this.getPosts({ status: "active", ...(author ? { author } : {}) }); }
    searchPosts(search) { return this.getPosts({ status: "active", ...(search ? { search } : {}) }); }
    getAuthorPosts(userID) { return this.getPublishedPosts({ author: userID }); }

    getProfile(userID) { return request(`/api/profiles/${encodeURIComponent(userID)}`); }
    upsertProfile(data) { return jsonRequest("/api/profiles/me", "PUT", data); }

    getBookmarks() { return request("/api/bookmarks"); }
    getBookmark(_, postID) { return request(`/api/bookmarks/${encodeURIComponent(postID)}`); }
    toggleBookmark(_, postID) { return request(`/api/bookmarks/${encodeURIComponent(postID)}`, { method: "POST" }); }

    async uploadFile(file) {
        const form = new FormData();
        form.append("file", file);
        const result = await request("/api/uploads", { method: "POST", body: form });
        return { $id: result.$id, public_id: result.public_id, url: result.url };
    }
    async deleteFile(fileID) { try { await request(`/api/uploads/${encodeURIComponent(fileID)}`, { method: "DELETE" }); return true; } catch { return false; } }
    getFileView(fileID) {
        if (!fileID) return "";
        if (/^https?:\/\//i.test(fileID)) return fileID;
        return `${conf.apiBaseUrl}/uploads/${encodeURIComponent(fileID)}`;
    }
    getFilePreview(fileID) { return this.getFileView(fileID); }

    getModelInfo() { return request("/api/ml/model-info"); }
    trainEngagementModel() { return request("/api/ml/train", { method: "POST" }); }
    predictEngagement(features) { return jsonRequest("/api/ml/predict", "POST", features); }
}

export default new Service();
