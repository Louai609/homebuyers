import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import ReportPreview from "./pages/ReportPreview";
import PaymentResult from "./pages/PaymentResult";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rapport/:bagId" element={<ReportPreview />} />
          <Route path="/rapport/betaling/resultaat" element={<PaymentResult />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
