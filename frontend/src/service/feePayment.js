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