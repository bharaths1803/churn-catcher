import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const usePredictStore = create((set, get) => ({
  isPredicting: false,
  predictions: null,

  predict: async (formData) => {
    try {
      set({ isPredicting: true });
      const res = await axios.post("https://churn-catcher-production.up.railway.app/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ predictions: res.data });
      toast.success("Predictions made successfully!!");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Upload failed. Please try again."
      );
    } finally {
      set({ isPredicting: false });
    }
  },
}));
