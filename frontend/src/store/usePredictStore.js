import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const usePredictStore = create((set, get) => ({
  isPredicting: false,
  predictions: null,

  predict: async (formData) => {
    try {
      set({ isPredicting: true });
      const res = await axios.post("http://127.0.0.1:5000/predict", formData, {
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
