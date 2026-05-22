import API from "./axios";

export const sendOtp = async (phoneNumber) => {
  console.log("LOGIN URL:", API.defaults.baseURL + "/auth/login");
  return API.post("/auth/login", {
    phoneNumber,
  });
};

// ✅ VERIFY OTP
export const verifyOtp = (phoneNumber, otp) => {
  return API.post("/auth/verify-otp", {
    phoneNumber,
    otp,
  });
};