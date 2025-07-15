// src/api/payment.js
import axios from "axios";

export const createFeePayment = async (apartmentId, month) => {
  return axios.post(`${import.meta.env.VITE_API_URL}/api/fees/pay`, {
    apartmentId,
    month,
  });
};
export const getAllFees = async () => {
  return axios.get(`${import.meta.env.VITE_API_URL}/api/fees`);
};
export const fetchPaidContracts = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contracts/paid`);
    return res.data?.data || [];
  } catch (err) {
    console.error("❌ Failed to fetch contracts", err);
  }
};
