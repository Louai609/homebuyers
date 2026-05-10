import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { getPaymentStatus } from "../api/client";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const paymentId = params.get("payment_id") ?? "";
  const [status, setStatus] = useState<"loading" | "paid" | "failed">("loading");

  useEffect(() => {
    if (!paymentId) { setStatus("failed"); return; }
    getPaymentStatus(paymentId)
      .then((r) => setStatus(r.status === "paid" ? "paid" : "failed"))
      .catch(() => setStatus("failed"));
  }, [paymentId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <span className="text-xl font-bold text-brand-600 tracking-tight mb-10">niwue</span>

      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader size={36} className="animate-spin" />
          <p>Betaling controleren…</p>
        </div>
      )}

      {status === "paid" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle size={48} className="text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900">Betaling geslaagd!</h1>
          <p className="text-gray-500 max-w-sm">
            Je rapport wordt naar je e-mailadres gestuurd. Je kunt het ook direct hier downloaden.
          </p>
          <a
            href={`${import.meta.env.VITE_API_URL ?? "http://localhost:8002"}/reports/download/${paymentId}`}
            className="mt-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Download PDF rapport
          </a>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle size={48} className="text-red-400" />
          <h1 className="text-2xl font-bold text-gray-900">Betaling mislukt</h1>
          <p className="text-gray-500 max-w-sm">
            Er is iets misgegaan. Je bent niet in rekening gebracht. Probeer het opnieuw.
          </p>
          <a href="/" className="mt-4 text-brand-600 underline text-sm">Terug naar de homepage</a>
        </div>
      )}
    </div>
  );
}
