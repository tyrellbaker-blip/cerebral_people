"use client";

import { useState } from "react";

interface NPILookupButtonProps {
  npi?: string;
  firstName?: string;
  lastName?: string;
  state?: string;
  role?: string;
}

export default function NPILookupButton({
  npi,
  firstName,
  lastName,
  state,
  role,
}: NPILookupButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/verify/npi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npi,
          firstName,
          lastName,
          state,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.reason || "Lookup failed");
        setResult(data.results || null);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Network error during lookup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleLookup}
        disabled={loading}
        className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      >
        {loading ? "Looking up NPI..." : "🔍 Verify NPI"}
      </button>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-3">
          <div className="text-sm font-medium text-red-900 mb-1">
            NPI Lookup Error
          </div>
          <div className="text-sm text-red-700">{error}</div>
          {result && (
            <div className="text-xs text-red-600 mt-2 font-mono whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </div>
          )}
        </div>
      )}

      {result && !error && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-900 mb-2">
            ✓ NPI Registry Match (Score: {result.score}/10)
          </div>
          <div className="space-y-2 text-sm text-green-800">
            <div>
              <span className="font-medium">Name:</span> {result.name?.first}{" "}
              {result.name?.last} {result.name?.credential}
            </div>
            <div>
              <span className="font-medium">NPI:</span> {result.npi}
            </div>
            {result.taxonomies && result.taxonomies.length > 0 && (
              <div>
                <span className="font-medium">Specialties:</span>
                <ul className="list-disc list-inside ml-2 mt-1">
                  {result.taxonomies.map((t: any, i: number) => (
                    <li key={i}>
                      {t.desc} ({t.code})
                      {t.primary && " - PRIMARY"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.addresses && result.addresses.length > 0 && (
              <div>
                <span className="font-medium">Practice States:</span>{" "}
                {[...new Set(result.addresses.map((a: any) => a.state))].join(", ")}
              </div>
            )}
            {result.reasons && result.reasons.length > 0 && (
              <div>
                <span className="font-medium">Match Reasons:</span>
                <ul className="list-disc list-inside ml-2 mt-1">
                  {result.reasons.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.enumeration_date && (
              <div className="text-xs text-green-600 mt-2">
                Enumerated: {new Date(result.enumeration_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
