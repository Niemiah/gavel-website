"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

interface Job {
  id: number;
  job_title: string;
  Company?: string;
  job_location?: string;
  job_type?: string;
  job_category?: string;
  whitelist_matches?: string;
  blacklist_matches?: string;
  job_details_url?: string;
  job_description_summary?: string;
  job_posted_date?: string;
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter state variables for location, job type, and category
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [jobCategoryFilter, setJobCategoryFilter] = useState("");

  // Define 20 legal keywords that a valid posting must have at least one of
  const legalKeywords = [
    "attorney",
    "lawyer",
    "legal",
    "counsel",
    "litigation",
    "law firm",
    "paralegal", // sometimes a legal position, but you might want to filter these out if they're non-attorney roles
    "esquire",
    "prosecution",
    "defense",
    "trial",
    "court",
    "judicial",
    "compliance",
    "regulatory",
    "civil",
    "criminal",
    "intellectual property",
    "legal research",
    "legal advisor"
  ];

  // Define unwanted (blacklisted) keywords to exclude from job_title and job_description
  const blacklistKeywords = [
    "secretary",
    "paralegal",
    "assistant",
    "therapist",
    "counselor",
    "conseling"
  ];

  // Helper function to normalize strings for comparison (used for job type)
  const normalize = (str: string) => str.toLowerCase().replace(/-/g, " ").trim();

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          job_title,
          Company,
          job_location,
          job_type,
          job_category,
          whitelist_matches,
          blacklist_matches,
          job_details_url,
          job_description_summary,
          job_posted_date
        `)
        // Only include jobs where whitelist_matches is not null and not an empty string
        .not("whitelist_matches", "is", null)
        .neq("whitelist_matches", "")
        .order("job_posted_date", { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
        setErrorMessage(error.message || "Error fetching jobs");
      } else {
        console.log("Fetched jobs:", data);
        setJobs(data);
      }
    }
    fetchJobs();
  }, []);

  // Apply client-side filters (search term, location, job type, category)
  const baseFilteredJobs = jobs.filter((job) => {
    const matchesSearch = job.job_title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "" ||
      (job.job_location &&
        job.job_location.toLowerCase().includes(locationFilter.toLowerCase()));
    const matchesJobType =
      jobTypeFilter === "" ||
      (job.job_type &&
        normalize(job.job_type).includes(normalize(jobTypeFilter)));
    const matchesCategory =
      jobCategoryFilter === "" ||
      (job.job_category &&
        job.job_category.toLowerCase() === jobCategoryFilter.toLowerCase());
    return matchesSearch && matchesLocation && matchesJobType && matchesCategory;
  });

  // Further filter jobs to include only those that:
  // 1. Contain at least one legal keyword in job_title or job_description.
  // 2. Do NOT contain any blacklisted keywords in job_title or job_description.
  const finalFilteredJobs = baseFilteredJobs.filter((job) => {
    const textToCheck = (
      job.job_title + " " + (job.job_description_summary || "")
    ).toLowerCase();
    // Must have at least one legal keyword
    const hasLegalKeyword = legalKeywords.some((keyword) =>
      textToCheck.includes(keyword)
    );
    if (!hasLegalKeyword) return false;

    // Exclude if any blacklisted keyword is found
    const hasBlacklisted = blacklistKeywords.some((keyword) =>
      textToCheck.includes(keyword)
    );
    if (hasBlacklisted) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Fixed Navigation Bar */}
      <nav className="bg-white shadow-md fixed w-full z-10 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-3xl font-extrabold text-blue-700 mr-2">
                Gavel
              </span>
              <span className="text-lg text-gray-600 italic">
                Your Legal Career Hub
              </span>
            </div>
            <div className="hidden sm:flex space-x-8">
              <Link
                href="/"
                className="text-lg font-medium text-gray-600 hover:text-blue-700"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium text-gray-600 hover:text-blue-700"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-lg font-medium text-gray-600 hover:text-blue-700"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {/* Blue Header Section */}
        <header className="bg-blue-900 py-16 text-center">
          <h1 className="text-5xl font-black text-white tracking-tight sm:text-6xl">
            Latest Legal Job Postings
          </h1>
          <p className="mt-4 text-2xl text-blue-200">
            Browse opportunities and advance your legal career with top employers.
          </p>
        </header>

        {/* Centralized Search Bar */}
        <div className="search-bar-container text-center mt-0">
          <input
            type="text"
            placeholder="Search legal jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/2 p-3 border border-gray-300 rounded text-gray-900 placeholder-gray-600"
          />
          <button className="ml-2 p-3 bg-blue-600 text-white rounded hover:bg-blue-700">
            Search
          </button>
        </div>

        {/* Filters Section */}
        <div className="filters-container flex justify-center gap-4 mb-8 mt-4">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border border-gray-500 p-2 rounded text-gray-900 bg-white"
          >
            <option value="">All Locations</option>
            <option value="New York">New York</option>
            <option value="California">California</option>
          </select>

          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="border border-gray-500 p-2 rounded text-gray-900 bg-white"
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="part time contract">Part Time Contract</option>
          </select>

          <select
            value={jobCategoryFilter}
            onChange={(e) => setJobCategoryFilter(e.target.value)}
            className="border border-gray-500 p-2 rounded text-gray-900 bg-white"
          >
            <option value="">All Categories</option>
            <option value="lawyer">Lawyer</option>
            <option value="counsel">Counsel</option>
            <option value="dla">DLA</option>
          </select>
        </div>

        {/* Job Postings Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Job Postings
          </h2>
          {errorMessage && (
            <p className="text-red-500 mb-4">{errorMessage}</p>
          )}
          {finalFilteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {finalFilteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-blue-200 rounded-lg p-6 hover:shadow-2xl transition-transform duration-300 hover:scale-105"
                >
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {job.job_title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    <span className="font-bold">Company:</span>{" "}
                    {job.Company ?? "Not provided"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Location:</span>{" "}
                    {job.job_location ?? "Not provided"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Type:</span>{" "}
                    {job.job_type ?? "Not provided"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Category:</span>{" "}
                    {job.job_category ?? "Not provided"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Whitelist Matches:</span>{" "}
                    {job.whitelist_matches && job.whitelist_matches.trim() !== ""
                      ? job.whitelist_matches
                      : "Not provided"}
                  </p>
                  <p className="mt-4 text-gray-700">
                    {job.job_description_summary ??
                      "No description available"}
                  </p>
                  {job.job_details_url && (
                    <Link
                      href={job.job_details_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-blue-500 hover:underline font-medium"
                    >
                      View Posting
                    </Link>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Posted on:{" "}
                    {job.job_posted_date
                      ? new Date(job.job_posted_date).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No job postings found.</p>
          )}
        </main>
      </div>
    </div>
  );
}
