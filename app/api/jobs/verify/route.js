import { NextResponse } from "next/server";

const NVIDIA_API_KEY = process.env.NVIDIA_NIM_API_KEY;
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const MODEL = "meta/llama-3.1-8b-instruct";

// ── URL Verification ─────────────────────────────────────────────────
async function checkUrlActive(url) {
  if (!url) return { active: false, reason: "No URL provided" };

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };

  const DEAD_PHRASES = [
    "position filled", "job closed", "no longer available", "no longer accepting",
    "job has expired", "this job is no longer", "vacancy closed", "post is closed",
    "applications closed", "this listing has", "position has been filled",
  ];

  try {
    // HEAD request first (fast)
    const headRes = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(7000),
      redirect: "follow",
      headers,
    });

    if (headRes.status === 404 || headRes.status === 410) {
      return { active: false, reason: `Job not found (HTTP ${headRes.status})` };
    }
    if (headRes.status === 200) {
      // For well-known job sites, HEAD 200 is enough
      return { active: true, reason: `Verified live (HTTP 200)` };
    }

    // Fallback: GET and scan page content
    const getRes = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
      headers,
    });

    if (!getRes.ok) {
      return { active: false, reason: `HTTP ${getRes.status} — job may be removed` };
    }

    const html = await getRes.text();
    const lower = html.toLowerCase();

    const deadPhrase = DEAD_PHRASES.find((p) => lower.includes(p));
    if (deadPhrase) {
      return { active: false, reason: `Job page says: "${deadPhrase}"` };
    }

    // Check if "apply" button/text exists — sign it's still open
    const hasApply = /apply now|apply for this|submit application|apply online/i.test(html);
    if (hasApply) {
      return { active: true, reason: "Apply button found — job is open" };
    }

    return { active: true, reason: `URL reachable (HTTP ${getRes.status})` };
  } catch (e) {
    return { active: false, reason: `Unreachable: ${e.message?.slice(0, 60)}` };
  }
}

// ── Skill Extractor ───────────────────────────────────────────────────
function extractSkills(description) {
  const TECH = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Django",
    "Spring Boot", "Flask", "FastAPI", "SQL", "PostgreSQL", "MySQL", "MongoDB",
    "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "REST",
    "GraphQL", "Machine Learning", "Data Science", "Deep Learning", "NLP",
    "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn",
    "Next.js", "Vue", "Angular", "PHP", "Go", "Rust", "C++", "C#", ".NET",
    "Linux", "DevOps", "CI/CD", "Jenkins", "Kafka", "Spark", "Selenium",
    "Spring", "Hibernate", "JPA", "React Native", "Flutter", "Swift", "Kotlin",
    "Terraform", "Ansible", "Prometheus", "Grafana", "ElasticSearch",
  ];
  const found = TECH.filter((kw) => new RegExp(`\\b${kw.replace("+", "\\+")}\\b`, "i").test(description));
  return [...new Set(found)].slice(0, 7);
}

// ── Experience Extractor ──────────────────────────────────────────────
function extractExperience(description) {
  const range = description.match(/(\d+)\s*[-–to]+\s*(\d+)\s*years?/i);
  if (range) return `${range[1]}–${range[2]} Years`;
  const single = description.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  if (single) return `${single[1]}+ Years`;
  if (/fresher|entry.?level|0.{0,3}year|no experience/i.test(description)) return "Fresher / 0–1 Year";
  return "Not specified";
}

// ── Fallback Post (no LLM) ────────────────────────────────────────────
function fallbackPost(job, skills, experience) {
  const salary =
    job.salary_min && job.salary_max
      ? `₹${Math.round(job.salary_min / 100000)}–${Math.round(job.salary_max / 100000)} LPA`
      : job.salary_min
      ? `₹${Math.round(job.salary_min / 100000)}+ LPA`
      : "Not disclosed";

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return `🚀 *Job Alert | ${job.title}*

🏢 *Company:* ${job.company}
📍 *Location:* ${job.location}
💼 *Experience:* ${experience}
💰 *Salary:* ${salary}
🛠️ *Skills:* ${skills.length ? skills.join(" • ") : "See job description"}

✅ *Verified Active* (${today})

🔗 *Apply Now* 👇
${job.redirect_url}

━━━━━━━━━━━━━━━━━
📲 *Stack School* | stackschool.in
#JobAlert #TechJobs #India #Hiring2024 #${job.company.replace(/\s+/g, "")}`;
}

// ── LLM Post Framer ────────────────────────────────────────────────────
async function framePost(job, skills, experience) {
  if (!NVIDIA_API_KEY) return fallbackPost(job, skills, experience);

  const salary =
    job.salary_min && job.salary_max
      ? `₹${Math.round(job.salary_min / 100000)}–${Math.round(job.salary_max / 100000)} LPA`
      : job.salary_min
      ? `₹${Math.round(job.salary_min / 100000)}+ LPA`
      : "Not disclosed";

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const prompt = `You are a job alert formatter for a WhatsApp channel called "Stack School Jobs".
Create a clean, engaging WhatsApp message for this job. Use emojis. Max 22 lines. 
IMPORTANT: Output ONLY the message text — no intro, no explanation, no markdown code block.

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Salary: ${salary}
- Experience: ${experience}
- Key Skills: ${skills.join(", ") || "Not specified"}
- Apply Link: ${job.redirect_url}
- Verified: ${today}

Required format (follow exactly):
🚀 *Job Alert | {title}*
[blank line]
🏢 *Company:* {company}
📍 *Location:* {location}
💼 *Experience:* {experience}
💰 *Salary:* {salary}
🛠️ *Skills:* {skills separated by •}
[blank line]
✅ *Verified Active* ({date})
[blank line]
🔗 *Apply Now* 👇
{apply_link}
[blank line]
━━━━━━━━━━━━━━━━━
📲 *Stack School* | stackschool.in
#JobAlert #TechJobs #India #Hiring2024`;

  try {
    const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
        top_p: 0.9,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) return fallbackPost(job, skills, experience);

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    // Reject LLM output if it looks wrong (too short or missing job title)
    if (!content || content.length < 100 || !content.includes(job.company)) {
      return fallbackPost(job, skills, experience);
    }

    return content;
  } catch {
    return fallbackPost(job, skills, experience);
  }
}

// ── Route Handler ──────────────────────────────────────────────────────
export async function POST(req) {
  const { job } = await req.json();

  const { active, reason } = await checkUrlActive(job.redirect_url);

  if (!active) {
    return NextResponse.json({
      ...job,
      isActive: false,
      verifyReason: reason,
      skills: [],
      experience: "",
      formattedPost: "",
      verifiedAt: new Date().toISOString(),
    });
  }

  const skills = extractSkills(job.description);
  const experience = extractExperience(job.description);
  const formattedPost = await framePost(job, skills, experience);

  return NextResponse.json({
    ...job,
    isActive: true,
    verifyReason: reason,
    skills,
    experience,
    formattedPost,
    verifiedAt: new Date().toISOString(),
  });
}
