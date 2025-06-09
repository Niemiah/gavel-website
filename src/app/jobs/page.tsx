"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

// --- US STATES LIST ---
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine",
  "Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma",
  "Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

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
  Timestamp?: string;
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [jobCategoryFilter, setJobCategoryFilter] = useState("");
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]); // NEW

  // Custom dropdown state
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setLocationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Legal and blacklist keywords
  const legalKeywords = [
    "attorney","lawyer","legal","counsel","litigation","law firm","paralegal",
    "esquire","prosecution","defense","trial","court","judicial","compliance",
    "regulatory","civil","criminal","intellectual property","legal research","legal advisor"
  ];
  const blacklistKeywords = [
    "secretary","paralegal","assistant","therapist","counselor","conseling"
  ];
  const normalize = (str: string) => str.toLowerCase().replace(/-/g, " ").trim();

  // Fetch jobs from supabase
  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id, job_title, Company, job_location, job_type, job_category,
          whitelist_matches, blacklist_matches, job_details_url,
          job_description_summary, job_posted_date, Timestamp
        `)
        .not("whitelist_matches", "is", null)
        .neq("whitelist_matches", "")
        .order("Timestamp", { ascending: false });

      if (error) {
        setErrorMessage(error.message || "Error fetching jobs");
      } else {
        setJobs(data);

        // Set unique categories dynamically from jobs data
        const categoriesSet = new Set(
          data
            .map((job: Job) => job.job_category?.trim())
            .filter((cat) => cat && cat.length > 0)
        );
        setUniqueCategories(Array.from(categoriesSet).sort());
      }
    }
    fetchJobs();
  }, []);

  // Filtering logic
  const baseFilteredJobs = jobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      job.job_title?.toLowerCase().includes(searchLower) ||
      job.Company?.toLowerCase().includes(searchLower) ||
      job.job_location?.toLowerCase().includes(searchLower) ||
      job.job_type?.toLowerCase().includes(searchLower) ||
      job.job_category?.toLowerCase().includes(searchLower) ||
      job.job_description_summary?.toLowerCase().includes(searchLower);

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

  const finalFilteredJobs = baseFilteredJobs.filter((job) => {
    const textToCheck = (
      job.job_title + " " + (job.job_description_summary || "")
    ).toLowerCase();
    const hasLegalKeyword = legalKeywords.some((keyword) =>
      textToCheck.includes(keyword)
    );
    if (!hasLegalKeyword) return false;
    const hasBlacklisted = blacklistKeywords.some((keyword) =>
      textToCheck.includes(keyword)
    );
    if (hasBlacklisted) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Nav Bar */}
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
              <Link href="/" className="text-lg font-medium text-gray-600 hover:text-blue-700">
                Home
              </Link>
              <Link href="/about" className="text-lg font-medium text-gray-600 hover:text-blue-700">
                About
              </Link>
              <Link href="/contact" className="text-lg font-medium text-gray-600 hover:text-blue-700">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {/* Header Section */}
        <header className="bg-blue-900 py-16 text-center">
          <h1 className="text-5xl font-black text-white tracking-tight sm:text-6xl">
            Latest Legal Job Postings
          </h1>
          <p className="mt-4 text-2xl text-blue-200">
            Browse opportunities and advance your legal career with top employers.
          </p>
        </header>

        {/* Search Bar */}
        <div className="search-bar-container text-center mt-8">
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

        {/* FILTERS */}
        <div className="filters-container flex justify-center gap-4 mb-8 mt-4">
          {/* Custom Location Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLocationDropdownOpen((open) => !open)}
              className={`border border-blue-500 p-2 rounded text-gray-900 bg-white flex items-center justify-between w-56 shadow-md transition duration-150
                ${locationDropdownOpen ? "ring-2 ring-blue-400" : ""}
              `}
              type="button"
            >
              <span>
                {locationFilter ? locationFilter : "All Locations"}
              </span>
              <svg
                className={`w-5 h-5 ml-2 transition-transform ${
                  locationDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {locationDropdownOpen && (
              <div className="absolute z-20 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-blue-300 overflow-y-auto max-h-72 custom-scrollbar animate-fade-in">
                {/* All Locations Option */}
                <div
                  className={`cursor-pointer px-4 py-3 hover:bg-blue-100 font-semibold ${
                    !locationFilter ? "bg-blue-50 text-gray-900" : "text-gray-900"
                  }`}
                  onClick={() => {
                    setLocationFilter("");
                    setLocationDropdownOpen(false);
                  }}
                >
                  All Locations
                </div>
                {/* All States */}
                {US_STATES.map((state) => (
                  <div
                    key={state}
                    className={`cursor-pointer px-4 py-3 transition font-medium
                      ${locationFilter === state ? "bg-blue-600 text-gray-900" : "text-gray-800"}
                      hover:bg-blue-100 hover:text-gray-900
                    `}
                    onClick={() => {
                      setLocationFilter(state);
                      setLocationDropdownOpen(false);
                    }}
                  >
                    {state}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Job Type Filter (hardcoded) */}
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
          {/* Category Filter (DYNAMIC) */}
          <select
            value={jobCategoryFilter}
            onChange={(e) => setJobCategoryFilter(e.target.value)}
            className="border border-gray-500 p-2 rounded text-gray-900 bg-white"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
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
                  {/* Whitelist hidden */}
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
                    {job.Timestamp
                      ? new Date(job.Timestamp).toLocaleDateString()
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
