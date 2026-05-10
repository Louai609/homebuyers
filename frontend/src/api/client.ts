import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8002",
});

export interface BuildingPreview {
  bag_id: string;
  address: string;
  build_year: number | null;
  risk_score: number | null;
  energy_label: string | null;
  is_monument: boolean;
  flood_risk_zone: string | null;
  soil_type: string | null;
  neighborhood: string | null;
}

export interface SearchResult {
  bag_id: string;
  address: string;
}

export const searchAddress = async (q: string): Promise<SearchResult[]> => {
  const { data } = await api.get("/public/search", { params: { q } });
  return data;
};

export const getPreview = async (bagId: string): Promise<BuildingPreview> => {
  const { data } = await api.get(`/public/preview/${bagId}`);
  return data;
};

export const createPayment = async (bagId: string, email: string) => {
  const { data } = await api.post("/payments/create", { bag_id: bagId, email });
  return data as { payment_id: string; checkout_url: string };
};

export const getPaymentStatus = async (paymentId: string) => {
  const { data } = await api.get(`/payments/status/${paymentId}`);
  return data as { id: string; status: string };
};
