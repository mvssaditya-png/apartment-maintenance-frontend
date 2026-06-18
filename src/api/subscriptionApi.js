import API from "./axios";

export const getSubscriptionStatus = () =>
  API.get("/subscriptions/status");

export const getSubscriptionPlans = () =>
  API.get("/subscriptions/plans");

export const createSubscriptionOrder = (payload) =>
  API.post("/subscriptions/create-order", payload);

export const verifySubscriptionPayment = (payload) =>
  API.post("/subscriptions/verify-payment", payload);

export const testActivateSubscription = (payload) =>
  API.post("/subscriptions/test-activate", payload);