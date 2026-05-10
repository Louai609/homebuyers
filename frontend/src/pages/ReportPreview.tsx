import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Shield, Zap, Droplets, Landmark, MapPin, ArrowLeft, Lock } from "lucide-react";
import { getPreview, createPayment } from "../api/client";

function RiskBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm">Onbekend</span>;
  const low = score < 40;
  const mid = score < 70;
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
        low ? "bg-green-100 text-green-800" : mid ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
      }`}
    >
      {score} / 100 — {low ? "Laag risico" : mid ? "Gemiddeld" : "Hoog risico"}
    </span>
  );
}

export default function ReportPreview() {
  const { bagId } = useParams<{ bagId: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: building, isLoading, isError } = useQuery({
    queryKey: ["preview", bagId],
    queryFn: () => getPreview(bagId!),
    enabled: !!bagId,
  });

  const handlePay = async () => {
    if (!email.includes("@")) { setError("Voer een geldig e-mailadres in."); return; }
    setLoading(true);
    setError("");
    try {
      const { checkout_url } = await createPayment(bagId!, email);
      window.location.href = checkout_url;
    } catch {
      setError("Betaling kon niet worden gestart. Probeer het opnieuw.");
      setLoading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Gegevens laden…</div>
  );
  if (isError || !building) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">Gebouw niet gevonden.</div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <span className="text-xl font-bold text-brand-600 tracking-tight">niwue</span>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">{building.address}</h1>
        <p className="text-sm text-gray-400 mt-1">BAG ID: {building.bag_id}</p>

        {/* Preview cards */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Card icon={Shield} label="Risicoscore">
            <RiskBadge score={building.risk_score} />
          </Card>
          <Card icon={Zap} label="Energielabel">
            <span className="font-semibold text-gray-800">{building.energy_label ?? "Onbekend"}</span>
          </Card>
          <Card icon={Droplets} label="Overstromingsrisico">
            <span className="text-gray-700 text-sm">{building.flood_risk_zone ?? "Onbekend"}</span>
          </Card>
          <Card icon={Landmark} label="Monument">
            <span className={`text-sm font-medium ${building.is_monument ? "text-amber-700" : "text-gray-500"}`}>
              {building.is_monument ? "Ja — renovatiebeperkingen" : "Nee"}
            </span>
          </Card>
          <Card icon={MapPin} label="Buurt" wide>
            <span className="text-gray-700 text-sm">{building.neighborhood ?? "–"}</span>
          </Card>
        </div>

        {/* Paywall */}
        <div className="mt-10 border border-gray-200 rounded-2xl p-6 bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-brand-600" />
            <span className="font-semibold text-gray-900">Volledig rapport</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Inclusief AI-risicoanalyse, bodemtype, CBS-buurtdata en een downloadbare PDF. Eenmalig €24,99.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Jouw e-mailadres"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Doorsturen naar betaling…" : "Betaal & download rapport — €24,99"}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">Veilige betaling via iDEAL · Mollie</p>
        </div>
      </main>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  children,
  wide,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wide">
        <Icon size={13} />
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
