import JobFinderDashboard from "./JobFinderDashboard";

export const metadata = {
  title: "Job Finder · Stack School",
  description: "AI-powered job search and WhatsApp post generator",
  robots: "noindex, nofollow",
};

export default function Page() {
  return <JobFinderDashboard />;
}
