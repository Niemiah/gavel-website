"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { Country, State, City } from "country-state-city";

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
  const [countryFilter, setCountryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [jobCategoryFilter, setJobCategoryFilter] = useState("");
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

  // Dropdown open state
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionDropdownOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch jobs + categories
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
          job_posted_date,
          Timestamp
        `)
        .not("whitelist_matches", "is", null)
        .neq("whitelist_matches", "")
        .order("Timestamp", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
      } else if (data) {
        setJobs(data);
        const cats = Array.from(
          new Set(
            data
              .map((j) => j.job_category?.trim())
              .filter((c): c is string => !!c)
          )
        ).sort();
        setUniqueCategories(cats);
      }
    }
    fetchJobs();
  }, []);

  // Country → Regions → Cities (filtering out counties)
  const countries = Country.getAllCountries();
  const regions = countryFilter ? State.getStatesOfCountry(countryFilter) : [];
  const rawCities =
    countryFilter && regionFilter
      ? City.getCitiesOfState(countryFilter, regionFilter)
      : [];
  const cities = rawCities.filter(
    (c) => !c.name.toLowerCase().includes("county")
  );

  // Filtering logic
  const baseFilteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      job.job_title?.toLowerCase().includes(term) ||
      job.Company?.toLowerCase().includes(term) ||
      job.job_location?.toLowerCase().includes(term) ||
      job.job_type?.toLowerCase().includes(term) ||
      job.job_category?.toLowerCase().includes(term) ||
      job.job_description_summary?.toLowerCase().includes(term);

    const loc = (job.job_location || "").toLowerCase();
    const matchesCountry =
      !countryFilter ||
      loc.includes(
        countries.find((c) => c.isoCode === countryFilter)?.name.toLowerCase() ||
          ""
      );
    const matchesRegion =
      !regionFilter ||
      loc.includes(
        regions.find((r) => r.isoCode === regionFilter)?.name.toLowerCase() ||
          ""
      );
    const matchesCity =
      !cityFilter || loc.includes(cityFilter.toLowerCase());
    const matchesJobType =
      !jobTypeFilter ||
      job.job_type?.toLowerCase().includes(jobTypeFilter.toLowerCase());
    const matchesCategory =
      !jobCategoryFilter ||
      job.job_category?.toLowerCase() === jobCategoryFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesCountry &&
      matchesRegion &&
      matchesCity &&
      matchesJobType &&
      matchesCategory
    );
  });

  const finalFilteredJobs = baseFilteredJobs;

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
        {/* Header */}
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
            className="w-1/2 p-3 border border-gray-300 rounded bg-white text-black placeholder-gray-600"
          />
          <button className="ml-2 p-3 bg-blue-600 text-white rounded hover:bg-blue-700">
            Search
          </button>
        </div>

        {/* Display fetch errors */}
        {errorMessage && (
          <p className="mt-4 text-center text-red-500">{errorMessage}</p>
        )}

        {/* Filters */}
        <div className="filters-container flex justify-center gap-4 mb-8 mt-4">
          {/* Country Dropdown */}
          <div className="relative" ref={countryRef}>
            <button
              type="button"
              onClick={() => setCountryDropdownOpen((o) => !o)}
              className={`border border-blue-500 p-2 rounded text-gray-900 bg-white flex items-center justify-between w-56 shadow-md transition duration-150 ${
                countryDropdownOpen ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <span>
                {countryFilter
                  ? countries.find((c) => c.isoCode === countryFilter)?.name
                  : "Global"}
              </span>
              <svg
                className={`w-5 h-5 ml-2 transition-transform ${
                  countryDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {countryDropdownOpen && (
              <div className="absolute z-20 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-blue-300 overflow-y-auto max-h-72 custom-scrollbar animate-fade-in">
                <div
                  className={`cursor-pointer px-4 py-3 hover:bg-blue-100 font-semibold ${
                    !countryFilter ? "bg-blue-50 text-gray-900" : "text-gray-900"
                  }`}
                  onClick={() => {
                    setCountryFilter("");
                    setRegionFilter("");
                    setCityFilter("");
                    setCountryDropdownOpen(false);
                  }}
                >
                  Global
                </div>
                {countries.map((c) => (
                  <div
                    key={c.isoCode}
                    className={`cursor-pointer px-4 py-3 transition font-medium ${
                      countryFilter === c.isoCode ? "bg-blue-600 text-gray-900" : "text-gray-800"
                    } hover:bg-blue-100 hover:text-gray-900`}
                    onClick={() => {
                      setCountryFilter(c.isoCode);
                      setRegionFilter("");
                      setCityFilter("");
                      setCountryDropdownOpen(false);
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Region Dropdown */}
          {countryFilter && (
            <div className="relative" ref={regionRef}>
              <button
                type="button"
                onClick={() => setRegionDropdownOpen((o) => !o)}
                className={`border border-blue-500 p-2 rounded text-gray-900 bg-white flex items-center justify-between w-56 shadow-md transition duration-150 ${
                  regionDropdownOpen ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <span>
                  {regionFilter
                    ? regions.find((r) => r.isoCode === regionFilter)?.name
                    : "All Regions"}
                </span>
                <svg
                  className={`w-5 h-5 ml-2 transition-transform ${
                    regionDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {regionDropdownOpen && (
                <div className="absolute z-20 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-blue-300 overflow-y-auto max-h-72 custom-scrollbar animate-fade-in">
                  <div
                    className={`cursor-pointer px-4 py-3 hover:bg-blue-100 font-semibold ${
                      !regionFilter ? "bg-blue-50 text-gray-900" : "text-gray-900"
                    }`}
                    onClick={() => {
                      setRegionFilter("");
                      setCityFilter("");
                      setRegionDropdownOpen(false);
                    }}
                  >
                    All Regions
                  </div>
                  {regions.map((r) => (
                    <div
                      key={r.isoCode}
                      className={`cursor-pointer px-4 py-3 transition font-medium ${
                        regionFilter === r.isoCode ? "bg-blue-600 text-gray-900" : "text-gray-800"
                      } hover:bg-blue-100 hover:text-gray-900`}
                      onClick={() => {
                        setRegionFilter(r.isoCode);
                        setCityFilter("");
                        setRegionDropdownOpen(false);
                      }}
                    >
                      {r.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* City Dropdown */}
          {regionFilter && (
            <div className="relative" ref={cityRef}>
              <button
                type="button"
                onClick={() => setCityDropdownOpen((o) => !o)}
                className={`border border-blue-500 p-2 rounded text-gray-900 bg-white flex items-center justify-between w-56 shadow-md transition duration-150 ${
                  cityDropdownOpen ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <span>{cityFilter || "All Cities"}</span>
                <svg
                  className={`w-5 h-5 ml-2 transition-transform ${cityDropdownOpen ? "rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {cityDropdownOpen && (
                <div className="absolute z-20 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-blue-300 overflow-y-auto max-h-72 custom-scrollbar animate-fade-in">
                  <div
                    className={`cursor-pointer px-4 py-3 hover:bg-blue-100 font-semibold ${!cityFilter ? "bg-blue-50 text-gray-900" : "text-gray-900"
                      }`}
                    onClick={() => {
                      setCityFilter("");
                      setCityDropdownOpen(false);
                    }}
                  >
                    All Cities
                  </div>
                  {cities.map((c) => (
                    <div
                      key={c.name}
                      className={`cursor-pointer px-4 py-3 transition font-medium ${cityFilter === c.name ? "bg-blue-600 text-gray-900" : "text-gray-800"
                        } hover:bg-blue-100 hover:text-gray-900`}
                      onClick={() => {
                        setCityFilter(c.name);
                        setCityDropdownOpen(false);
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Job Type Filter */}
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

          {/* Category Filter */}
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

        {/* Job Postings */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Job Postings
          </h2>
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
                    <span className="font-bold">Company:</span> {job.Company ?? "Not provided"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Location:</span> {job.job_location ?? "Not provided"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Type:</span> {job.job_type ?? "Not provided"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Category:</span> {job.job_category ?? "Not provided"}
                  </p>
                  <p className="mt-4 text-gray-700">
                    {job.job_description_summary ?? "No description available"}
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
