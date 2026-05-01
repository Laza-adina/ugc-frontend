// src/lib/api.js
const SERVICES = {
    auth: process.env.NEXT_PUBLIC_AUTH_API,
    marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_API,
    campaign: process.env.NEXT_PUBLIC_CAMPAIGN_API,
    collect: process.env.NEXT_PUBLIC_COLLECT_API,
  };
  
  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  async function request(service, path, options = {}) {
    const token = getToken();
    const url = `${SERVICES[service]}${path}`;
  
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw { status: res.status, message: data.message || 'Erreur serveur' };
    }
  
    return data;
  }
  
  export const api = {
    // Auth
    auth: {
      register: (body) => request('auth', '/auth/register', { method: 'POST', body }),
      login: (body) => request('auth', '/auth/login', { method: 'POST', body }),
      me: () => request('auth', '/auth/me'),
      updateProfile: (body) => request('auth', '/auth/me', { method: 'PATCH', body }),
      logout: () => request('auth', '/auth/logout', { method: 'POST' }),
    },
  
    // Marketplace
    creators: {
      create: (body) => request('marketplace', '/api/v1/creators', { method: 'POST', body }),
      me: () => request('marketplace', '/api/v1/creators/me'),
      update: (body) => request('marketplace', '/api/v1/creators/me', { method: 'PATCH', body }),
      getById: (id) => request('marketplace', `/api/v1/creators/${id}`),
      search: (params) => request('marketplace', `/api/v1/search/creators?${new URLSearchParams(params)}`),
      match: (body) => request('marketplace', '/api/v1/matching', { method: 'POST', body }),
      addPortfolio: (body) => request('marketplace', '/api/v1/creators/me/portfolio', { method: 'POST', body }),
      deletePortfolio: (itemId) => request('marketplace', `/api/v1/creators/me/portfolio/${itemId}`, { method: 'DELETE' }),
      updateVetting: (id, body) => request('marketplace', `/api/v1/creators/${id}/vetting`, { method: 'PATCH', body }),
    },
  
    brands: {
      create: (body) => request('marketplace', '/api/v1/brands', { method: 'POST', body }),
      list: () => request('marketplace', '/api/v1/brands'),
      getById: (id) => request('marketplace', `/api/v1/brands/${id}`),
      update: (id, body) => request('marketplace', `/api/v1/brands/${id}`, { method: 'PATCH', body }),
      delete: (id) => request('marketplace', `/api/v1/brands/${id}`, { method: 'DELETE' }),
      addProduct: (id, body) => request('marketplace', `/api/v1/brands/${id}/products`, { method: 'POST', body }),
      deleteProduct: (id, productId) => request('marketplace', `/api/v1/brands/${id}/products/${productId}`, { method: 'DELETE' }),
    },
  
    // Campaign
    campaigns: {
      create: (body) => request('campaign', '/api/v1/campaigns', { method: 'POST', body }),
      list: (params) => request('campaign', `/api/v1/campaigns?${new URLSearchParams(params || {})}`),
      getById: (id) => request('campaign', `/api/v1/campaigns/${id}`),
      update: (id, body) => request('campaign', `/api/v1/campaigns/${id}`, { method: 'PATCH', body }),
      archive: (id) => request('campaign', `/api/v1/campaigns/${id}`, { method: 'DELETE' }),
      upsertBrief: (id, body) => request('campaign', `/api/v1/campaigns/${id}/brief`, { method: 'PUT', body }),
      getBrief: (id) => request('campaign', `/api/v1/campaigns/${id}/brief`),
    },
  
    collaborations: {
      invite: (campaignId, body) => request('campaign', `/api/v1/collaborations/campaigns/${campaignId}/invite`, { method: 'POST', body }),
      list: (campaignId) => request('campaign', `/api/v1/collaborations/campaigns/${campaignId}`),
      me: () => request('campaign', '/api/v1/collaborations/me'),
      respond: (id, body) => request('campaign', `/api/v1/collaborations/${id}/respond`, { method: 'PATCH', body }),
      getById: (id) => request('campaign', `/api/v1/collaborations/${id}`),
    },
  
    contents: {
      submit: (collaborationId, body) => request('campaign', `/api/v1/contents/collaborations/${collaborationId}`, { method: 'POST', body }),
      list: (collaborationId) => request('campaign', `/api/v1/contents/collaborations/${collaborationId}`),
      review: (contentId, body) => request('campaign', `/api/v1/contents/${contentId}/review`, { method: 'PATCH', body }),
    },
  
    messages: {
      send: (collaborationId, body) => request('campaign', `/api/v1/messages/collaborations/${collaborationId}`, { method: 'POST', body }),
      list: (collaborationId) => request('campaign', `/api/v1/messages/collaborations/${collaborationId}`),
    },
  
    // Collect
    ugc: {
      add: (body) => request('collect', '/api/v1/ugc', { method: 'POST', body }),
      list: (params) => request('collect', `/api/v1/ugc?${new URLSearchParams(params || {})}`),
      getById: (id) => request('collect', `/api/v1/ugc/${id}`),
      delete: (id) => request('collect', `/api/v1/ugc/${id}`, { method: 'DELETE' }),
      updateTags: (id, body) => request('collect', `/api/v1/ugc/${id}/tags`, { method: 'PUT', body }),
    },
  
    moderation: {
      pending: (brandId) => request('collect', `/api/v1/moderation/assets/pending${brandId ? `?brandId=${brandId}` : ''}`),
      moderate: (id, body) => request('collect', `/api/v1/moderation/assets/${id}`, { method: 'PATCH', body }),
      bulk: (body) => request('collect', '/api/v1/moderation/assets/bulk', { method: 'POST', body }),
    },
  
    widgets: {
      create: (body) => request('collect', '/api/v1/widgets', { method: 'POST', body }),
      list: (brandId) => request('collect', `/api/v1/widgets${brandId ? `?brandId=${brandId}` : ''}`),
      getById: (id) => request('collect', `/api/v1/widgets/${id}`),
      update: (id, body) => request('collect', `/api/v1/widgets/${id}`, { method: 'PATCH', body }),
      updateItems: (id, body) => request('collect', `/api/v1/widgets/${id}/items`, { method: 'PUT', body }),
    },
  };