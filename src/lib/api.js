// src/lib/api.js
const SERVICES = {
  auth: process.env.NEXT_PUBLIC_AUTH_API,
  marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_API,
  campaign: process.env.NEXT_PUBLIC_CAMPAIGN_API,
  collect: process.env.NEXT_PUBLIC_COLLECT_API,
};

const REFRESH_PATH = "/auth/refresh";

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("accessToken") || localStorage.getItem("access_token")
  );
};

const getRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("refreshToken") ||
    localStorage.getItem("refresh_token")
  );
};

const normalizeTokens = (tokens) => {
  const source = tokens?.tokens ?? tokens ?? {};
  return {
    accessToken:
      source.accessToken ||
      source.access_token ||
      source.token ||
      source.jwt ||
      source.access ||
      null,
    refreshToken:
      source.refreshToken || source.refresh_token || source.refresh || null,
  };
};

const setTokens = (tokens) => {
  if (typeof window === "undefined" || !tokens) return;
  const normalized = normalizeTokens(tokens);
  if (normalized.accessToken)
    localStorage.setItem("accessToken", normalized.accessToken);
  if (normalized.refreshToken)
    localStorage.setItem("refreshToken", normalized.refreshToken);
  if (normalized.accessToken || normalized.refreshToken) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
};

const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

let isRedirectingToLogin = false;

const redirectToLogin = () => {
  if (typeof window === "undefined" || isRedirectingToLogin) return;
  if (window.location.pathname === "/login") return;
  isRedirectingToLogin = true;
  window.location.assign("/login");
};

const handleAuthFailure = (message) => {
  clearAuthStorage();
  redirectToLogin();
  return { status: 401, message: message || "Session expiree" };
};

const parseJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

let refreshPromise = null;

async function refreshAccessToken() {
  if (typeof window === "undefined") {
    throw { status: 0, message: "Refresh unavailable on server" };
  }

  const baseUrl = SERVICES.auth;
  if (!baseUrl) {
    throw { status: 0, message: "Configuration error: auth API URL missing" };
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw handleAuthFailure("Session expiree");
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${baseUrl}${REFRESH_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await parseJson(res);
      if (!res.ok) {
        throw handleAuthFailure(data?.message || "Session expiree");
      }

      const tokens = data?.data?.tokens || data?.tokens || data?.data || data;
      const normalized = normalizeTokens(tokens);
      if (!normalized.accessToken) {
        throw handleAuthFailure(data?.message || "Session expiree");
      }

      setTokens(tokens);
      return tokens;
    })();
  }

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function request(service, path, options = {}) {
  const { _retry, skipRefresh, ...fetchOptions } = options;
  const token = getAccessToken();
  const baseUrl = SERVICES[service];

  if (!baseUrl) {
    console.error(
      `Service URL for "${service}" is not defined in environment variables.`,
    );
    throw {
      status: 0,
      message: `Configuration error: ${service} API URL missing`,
    };
  }

  const url = `${baseUrl}${path}`;

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(fetchOptions.headers || {}),
      },
      body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : undefined,
    });

    const data = await parseJson(res);

    if (!res.ok) {
      if (
        res.status === 401 &&
        !_retry &&
        !skipRefresh &&
        path !== REFRESH_PATH
      ) {
        try {
          await refreshAccessToken();
          return request(service, path, { ...options, _retry: true });
        } catch (refreshError) {
          throw {
            status: refreshError.status || res.status,
            message: refreshError.message || data?.message || "Session expiree",
          };
        }
      }

      throw { status: res.status, message: data?.message || "Erreur serveur" };
    }

    return data;
  } catch (error) {
    console.error(`Fetch error on ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  auth: {
    register: (body) =>
      request("auth", "/auth/register", {
        method: "POST",
        body,
        skipRefresh: true,
      }),
    login: (body) =>
      request("auth", "/auth/login", {
        method: "POST",
        body,
        skipRefresh: true,
      }),
    me: () => request("auth", "/auth/me"),
    updateProfile: (body) =>
      request("auth", "/auth/me", { method: "PATCH", body }),
    logout: () => request("auth", "/auth/logout", { method: "POST" }),
  },

  // Marketplace
  creators: {
    create: (body) =>
      request("marketplace", "/api/v1/creators", { method: "POST", body }),
    me: () => request("marketplace", "/api/v1/creators/me"),
    update: (body) =>
      request("marketplace", "/api/v1/creators/me", { method: "PATCH", body }),
    getById: (id) => request("marketplace", `/api/v1/creators/${id}`),
    search: (params) =>
      request(
        "marketplace",
        `/api/v1/search/creators?${new URLSearchParams(params)}`,
      ),
    addPortfolio: (body) =>
      request("marketplace", "/api/v1/creators/me/portfolio", {
        method: "POST",
        body,
      }),
    deletePortfolio: (itemId) =>
      request("marketplace", `/api/v1/creators/me/portfolio/${itemId}`, {
        method: "DELETE",
      }),
    updateVetting: (id, body) =>
      request("marketplace", `/api/v1/creators/${id}/vetting`, {
        method: "PATCH",
        body,
      }),
  },

  brands: {
    create: (body) =>
      request("marketplace", "/api/v1/brands", { method: "POST", body }),
    list: () => request("marketplace", "/api/v1/brands"),
    getById: (id) => request("marketplace", `/api/v1/brands/${id}`),
    update: (id, body) =>
      request("marketplace", `/api/v1/brands/${id}`, { method: "PATCH", body }),
    delete: (id) =>
      request("marketplace", `/api/v1/brands/${id}`, { method: "DELETE" }),
    addProduct: (id, body) =>
      request("marketplace", `/api/v1/brands/${id}/products`, {
        method: "POST",
        body,
      }),
    deleteProduct: (id, productId) =>
      request("marketplace", `/api/v1/brands/${id}/products/${productId}`, {
        method: "DELETE",
      }),
  },

  // Campaign
  campaigns: {
    create: (body) =>
      request("campaign", "/api/v1/campaigns", { method: "POST", body }),
    list: (params) =>
      request(
        "campaign",
        `/api/v1/campaigns?${new URLSearchParams(params || {})}`,
      ),
    getById: (id) => request("campaign", `/api/v1/campaigns/${id}`),
    update: (id, body) =>
      request("campaign", `/api/v1/campaigns/${id}`, { method: "PATCH", body }),
    archive: (id) =>
      request("campaign", `/api/v1/campaigns/${id}`, { method: "DELETE" }),
    upsertBrief: (id, body) =>
      request("campaign", `/api/v1/campaigns/${id}/brief`, {
        method: "PUT",
        body,
      }),
    getBrief: (id) => request("campaign", `/api/v1/campaigns/${id}/brief`),
  },

  collaborations: {
    invite: (campaignId, body) =>
      request(
        "campaign",
        `/api/v1/collaborations/campaigns/${campaignId}/invite`,
        { method: "POST", body },
      ),
    list: (campaignId) =>
      request("campaign", `/api/v1/collaborations/campaigns/${campaignId}`),
    me: () => request("campaign", "/api/v1/collaborations/me"),
    respond: (id, body) =>
      request("campaign", `/api/v1/collaborations/${id}/respond`, {
        method: "PATCH",
        body,
      }),
    getById: (id) => request("campaign", `/api/v1/collaborations/${id}`),
  },

  contents: {
    submit: (collaborationId, body) =>
      request(
        "campaign",
        `/api/v1/contents/collaborations/${collaborationId}`,
        { method: "POST", body },
      ),
    list: (collaborationId) =>
      request("campaign", `/api/v1/contents/collaborations/${collaborationId}`),
    review: (contentId, body) =>
      request("campaign", `/api/v1/contents/${contentId}/review`, {
        method: "PATCH",
        body,
      }),
  },

  messages: {
    send: (collaborationId, body) =>
      request(
        "campaign",
        `/api/v1/messages/collaborations/${collaborationId}`,
        { method: "POST", body },
      ),
    list: (collaborationId) =>
      request("campaign", `/api/v1/messages/collaborations/${collaborationId}`),
  },

  // Collect
  ugc: {
    add: (body) => request("collect", "/api/v1/ugc", { method: "POST", body }),
    list: (params) =>
      request("collect", `/api/v1/ugc?${new URLSearchParams(params || {})}`),
    getById: (id) => request("collect", `/api/v1/ugc/${id}`),
    delete: (id) =>
      request("collect", `/api/v1/ugc/${id}`, { method: "DELETE" }),
    updateTags: (id, body) =>
      request("collect", `/api/v1/ugc/${id}/tags`, { method: "PUT", body }),
  },

  moderation: {
    pending: (brandId) =>
      request(
        "collect",
        `/api/v1/moderation/assets/pending${brandId ? `?brandId=${brandId}` : ""}`,
      ),
    moderate: (id, body) =>
      request("collect", `/api/v1/moderation/assets/${id}`, {
        method: "PATCH",
        body,
      }),
    bulk: (body) =>
      request("collect", "/api/v1/moderation/assets/bulk", {
        method: "POST",
        body,
      }),
  },

  widgets: {
    create: (body) =>
      request("collect", "/api/v1/widgets", { method: "POST", body }),
    list: (brandId) =>
      request(
        "collect",
        `/api/v1/widgets${brandId ? `?brandId=${brandId}` : ""}`,
      ),
    getById: (id) => request("collect", `/api/v1/widgets/${id}`),
    update: (id, body) =>
      request("collect", `/api/v1/widgets/${id}`, { method: "PATCH", body }),
    updateItems: (id, body) =>
      request("collect", `/api/v1/widgets/${id}/items`, {
        method: "PUT",
        body,
      }),
  },

  reviews: {
    createRequest: (body) =>
      request("collect", "/api/v1/reviews", { method: "POST", body }),
    listRequests: (params) =>
      request(
        "collect",
        `/api/v1/reviews?${new URLSearchParams(params || {})}`,
      ),
    markAsSent: (id) =>
      request("collect", `/api/v1/reviews/${id}/sent`, { method: "PATCH" }),
    listPublished: (params) =>
      request(
        "collect",
        `/api/v1/reviews/published?${new URLSearchParams(params || {})}`,
      ),
    submit: (token, body) =>
      request("collect", `/api/v1/reviews/submit/${token}`, {
        method: "POST",
        body,
      }),
  },
};
