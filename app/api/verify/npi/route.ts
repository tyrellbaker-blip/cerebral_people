import { NextResponse } from "next/server";

interface ScoredResult {
  provider: any;
  score: number;
  reasons: string[];
}

/**
 * NPI Registry API lookup
 * Uses the free NPPES National Provider Identifier Registry
 * Documentation: https://npiregistry.cms.hhs.gov/api-page
 */
export async function POST(req: Request) {
  try {
    const { firstName, lastName, state, role, npi } = await req.json();

    // Build query parameters
    const params = new URLSearchParams({
      version: "2.1",
    });

    if (npi) {
      params.append("number", npi);
    }
    if (firstName) {
      params.append("first_name", firstName);
    }
    if (lastName) {
      params.append("last_name", lastName);
    }
    if (state) {
      params.append("state", state);
    }
    params.append("limit", "10");

    // Query NPPES NPI Registry
    const apiUrl = `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`;
    console.log("🔍 NPI API Query:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("❌ NPI Registry API error:", response.status, response.statusText);
      return NextResponse.json(
        { match: false, reason: "NPI Registry API error" },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("📊 NPI API Response:", JSON.stringify(data, null, 2).substring(0, 500));

    if (!data.results || data.results.length === 0) {
      console.log("⚠️ No NPI results found for query:", params.toString());
      return NextResponse.json(
        { match: false, reason: "No NPI match found", query: params.toString() },
        { status: 404 }
      );
    }

    // Define wanted taxonomies based on role
    const taxonomyMap: Record<string, string[]> = {
      PT: ["225100000X"], // Physical Therapist
      MD: ["207", "208"], // Physicians (starts with these codes)
      DO: ["207", "208"], // Osteopathic physicians
      PA: ["363A"], // Physician Assistant
    };

    const wantedTaxonomies = role ? taxonomyMap[role] : undefined;

    // Score matches
    const scoredResults = data.results.map((provider: any) => {
      let score = 0;
      const reasons: string[] = [];

      // Name matching (case insensitive, allow minor variants)
      const providerFirst = (provider.basic?.first_name || "").toLowerCase();
      const providerLast = (provider.basic?.last_name || "").toLowerCase();
      const searchFirst = (firstName || "").toLowerCase();
      const searchLast = (lastName || "").toLowerCase();

      if (providerFirst && searchFirst && providerFirst.startsWith(searchFirst)) {
        score += 3;
        reasons.push("First name matches");
      }
      if (providerLast && searchLast && providerLast === searchLast) {
        score += 3;
        reasons.push("Last name matches");
      }

      // State matching
      const addresses = provider.addresses || [];
      const stateMatch = state
        ? addresses.some((a: any) => a.state === state)
        : true;
      if (stateMatch && state) {
        score += 2;
        reasons.push("State matches");
      }

      // Taxonomy matching
      const taxonomies = provider.taxonomies || [];
      const taxonomyMatch = !wantedTaxonomies || taxonomies.some((t: any) => {
        const code = t.code || "";
        return wantedTaxonomies.some(wanted => code.startsWith(wanted));
      });
      if (taxonomyMatch && wantedTaxonomies) {
        score += 3;
        reasons.push("Role/specialty matches");
      }

      return {
        provider,
        score,
        reasons,
      };
    });

    // Sort by score
    scoredResults.sort((a: ScoredResult, b: ScoredResult) => b.score - a.score);

    const best = scoredResults[0];

    // Require minimum score of 5 for a match
    if (!best || best.score < 5) {
      return NextResponse.json(
        {
          match: false,
          reason: "NPI found but details didn't match well enough",
          results: scoredResults.slice(0, 3).map((r: ScoredResult) => ({
            npi: r.provider.number,
            name: `${r.provider.basic?.first_name || ""} ${r.provider.basic?.last_name || ""}`,
            score: r.score,
            reasons: r.reasons,
          })),
        },
        { status: 422 }
      );
    }

    // Extract useful data from best match
    const provider = best.provider;
    return NextResponse.json({
      match: true,
      score: best.score,
      reasons: best.reasons,
      npi: provider.number,
      name: {
        first: provider.basic?.first_name,
        last: provider.basic?.last_name,
        credential: provider.basic?.credential,
      },
      taxonomies: (provider.taxonomies || []).map((t: any) => ({
        code: t.code,
        desc: t.desc,
        primary: t.primary,
      })),
      addresses: (provider.addresses || []).map((a: any) => ({
        type: a.address_type,
        city: a.city,
        state: a.state,
        postal: a.postal_code,
      })),
      enumeration_date: provider.basic?.enumeration_date,
    });
  } catch (error) {
    console.error("NPI lookup error:", error);
    return NextResponse.json(
      { match: false, reason: "Internal server error" },
      { status: 500 }
    );
  }
}
