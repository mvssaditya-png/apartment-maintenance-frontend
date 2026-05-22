import API from "./axios";

// ============================
// DASHBOARD SUMMARY
// ============================
export const getResidentDashboard = () => {
  return API.get("/dashboard");
};

// ============================
// CURRENT USER
// ============================
export const getLoggedInUser = () => {
  return API.get("/users/me");
};

// ============================
// MONTHLY SUMMARY
// ============================
export const getMonthlySummary = (
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear()
) => {

  return API.get(
    `/reports/monthly-summary?month=${month}&year=${year}`
  );
};

// ============================
// SOCIETY BALANCE
// ============================
export const getSocietyBalance = () => {
  return API.get("/payments/balance");
};

// ============================
// UPDATE OPENING BALANCE
// ============================
export const updateOpeningBalance = (amount) => {
  return API.put("/finance/update-opening-balance", {
    amount,
  });
};

// ============================
// CREATE PAYMENT REQUEST
// ============================
export const createPaymentRequest = (payload) => {
  return API.post("/payment-requests", payload);
};

// ============================
// MY DUES
// ============================
export const getMyDues = () => {
  return API.get("/payments/my-dues");
};

// ============================
// SUBMIT PAYMENT
// ============================
export const submitPayment = (payload) => {
  return API.post("/payments/submit", payload);
};

// ============================
// UPLOAD RECEIPT IMAGE
// ============================
export const uploadReceiptImage = (image) => {
  const formData = new FormData();

  formData.append("file", {
    uri: image.uri,
    name: image.fileName || `receipt_${Date.now()}.jpg`,
    type: image.mimeType || "image/jpeg",
  });

  return API.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ============================
// SUBMITTED PAYMENTS / APPROVALS
// ============================
export const getSubmittedPayments = () => {
  return API.get("/payments/approvals");
};

// ============================
// VERIFY PAYMENT
// ============================
export const verifyPayment = (paymentId, approved) => {
  return API.post("/payments/verify", {
    paymentId,
    approved,
  });
};

// ============================
// ADD EXPENSE
// ============================
export const addExpense = (payload) => {
  return API.post("/expenses/add", payload);
};

// ============================
// VIEW EXPENSES
// ============================
export const getExpenses = () => {
  return API.get("/expenses/view");
};

// ============================
// DEFAULTERS
// ============================
export const getDefaulters = () => {
  return API.get("/reports/defaulters");
};

export const getDefaultersExportUrl = () => {
  return `${API.defaults.baseURL}/reports/defaulters/export`;
};

export const getFlatOptions = () => {
  return API.get("/flats/list");
};

export const getFlatPendingPayments = (flatId) => {
  return API.get(`/payments/flat/${flatId}/pending`);
};

export const recordPayment = (payload) => {
  return API.post("/payments/record", payload);
};

export const getFlatStatement = (flatId) => {
  return API.get(`/flats/${flatId}/statement`);
};

export const getFlatStatementExportUrl = (flatId) => {
  return `${API.defaults.baseURL}/flats/${flatId}/statement/export`;
};

export const getAllFlatStatementsExportUrl = () => {
  return `${API.defaults.baseURL}/reports/payment-history/export`;
};