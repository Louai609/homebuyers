import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldCheck, Zap, FileText } from "lucide-react";
import { searchAddress } from "../api/client";
import { useDebounce } from "../hooks/useDebounce";

export default function Home() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  const { data: results = [] } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchAddress(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
  });

  const handleSelect = useCallback(
    (bagId: string) => navigate(`/rapport/${bagId}`),
    [navigate]
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xl font-bold text-brand-600 tracking-tight">niwue</span>
        <span className="text-sm text-gray-400">Gebouwrapport voor kopers</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center leading-tight max-w-2xl">
          Wat weet jij over <span className="text-brand-600">dit huis</span>?
        </h1>
        <p className="mt-4 text-lg text-gray-500 text-center max-w-xl">
          Voer een adres in en ontvang een volledig risicorapport — energielabel,
          bodemrisico, overstromingszone, monumentstatus en AI-analyse.
        </p>

        {/* Search */}
        <div className="relative mt-10 w-full max-w-lg">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bijv. Herengracht 1, Amsterdam"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {results.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {results.map((r) => (
                <li
                  key={r.bag_id}
                  onClick={() => handleSelect(r.bag_id)}
                  className="px-4 py-3 hover:bg-brand-50 cursor-pointer text-sm text-gray-800"
                >
                  {r.address}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full">
          {[
            { icon: ShieldCheck, title: "Risicoscore", body: "Gebaseerd op bouwjaar, bodem, klimaatzone en materialen." },
            { icon: Zap,         title: "Energielabel", body: "Officieel EP-Online label inclusief renovatietips." },
            { icon: FileText,    title: "PDF Rapport",  body: "Direct downloadbaar, te delen met je makelaar of bank." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-brand-50 rounded-full">
                <Icon size={22} className="text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} Niwue B.V. · Alle rechten voorbehouden
      </footer>
    </div>
  );
}
