import API from "./axios";

export const getSuperAdminDashboard = () =>
  API.get("/super-admin/dashboard");

export const getSites = () =>
  API.get("/super-admin/sites");

export const createSite = (payload) =>
  API.post("/super-admin/sites", payload);

export const getSubscriptionPlans = () =>
  API.get("/super-admin/subscription-plans");

export const createSubscriptionPlan = (payload) =>
  API.post("/super-admin/subscription-plans", payload);

export const updateSubscriptionPlan = (planId, payload) =>
  API.put(`/super-admin/subscription-plans/${planId}`, payload);

export const toggleSubscriptionPlan = (planId) =>
  API.patch(`/super-admin/subscription-plans/${planId}/toggle`);

export const updateSite = (siteId, payload) =>
  API.put(`/super-admin/sites/${siteId}`, payload);

export const toggleSite = (siteId) =>
  API.patch(`/super-admin/sites/${siteId}/toggle`);

export const getSiteFlats = (siteId) =>
  API.get(`/super-admin/sites/${siteId}/flats`);

export const addSiteFlat = (siteId, data) =>
  API.post(`/super-admin/sites/${siteId}/flats`, data);

export const updateSiteFlat = (flatId, data) =>
  API.put(`/super-admin/flats/${flatId}`, data);

export const toggleSiteFlat = (flatId) =>
  API.patch(`/super-admin/flats/${flatId}/toggle`);