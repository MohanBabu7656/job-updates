import { NextResponse } from "next/server";

export async function POST(req) {
  const {
    keywords,
    location,
    maxDaysOld,
    minSalaryLPA,
    resultsCount,
    experienceLevel,
    jobType,
  } = await req.json();

  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  if (!APP_ID || !APP_KEY) {
    return NextResponse.json(
      { error: "Adzuna API credentials not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to .env.local" },
      { status: 500 }
    );
  }

  // Build smart keyword string
  let searchQuery = keywords || "developer";
  if (experienceLevel === "fresher") searchQuery += " fresher OR entry level OR 0 years";
  if (experienceLevel === "junior")  searchQuery += " 1 year OR 2 years junior";
  if (experienceLevel === "mid")     searchQuery += " 3 years OR 4 years OR 5 years";
  if (jobType === "remote")          searchQuery += " remote";
  if (jobType === "hybrid")          searchQuery += " hybrid";

  const minSalary = (minSalaryLPA || 0) * 100000;
  const params = new URLSearchParams({
    app_id: APP_ID,
    app_key: APP_KEY,
    results_per_page: String(Math.min(resultsCount || 10, 20)),
    what: searchQuery.trim(),
    where: location || "India",
    max_days_old: String(maxDaysOld || 7),
    sort_by: "date",
    content_type: "application/json",
  });
  if (minSalary > 0) params.set("salary_min", String(minSalary));

  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/in/search/1?${params}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Adzuna API error: ${err}` }, { status: res.status });
    }

    const data = await res.json();

    const jobs = (data.results || []).map((j) => ({
      id: j.id,
      title: j.title || "Unknown Title",
      company: j.company?.display_name || "Unknown Company",
      location: j.location?.display_name || location,
      salary_min: j.salary_min || undefined,
      salary_max: j.salary_max || undefined,
      description: j.description || "",
      redirect_url: j.redirect_url || "",
      created: j.created || new Date().toISOString(),
      category: j.category?.label || "IT Jobs",
      contract_type: j.contract_type || jobType || "full_time",
    }));

    return NextResponse.json({ jobs, total: data.count || 0 });
  } catch (err) {
    return NextResponse.json({ error: `Fetch failed: ${err}` }, { status: 500 });
  }
}
