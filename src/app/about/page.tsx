"use client";
import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative">
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 text-3xl text-gray-600 hover:text-blue-700 transition-transform duration-300 transform hover:scale-110"
        aria-label="Go Back"
      >
        ←
      </button>
      <h1 className="text-4xl font-bold text-blue-700 mb-4">About Gavel</h1>
      <p className="max-w-3xl text-xl text-gray-700 text-center">
        Gavel is dedicated to connecting top legal employers with exceptional legal talent.
        Our mission is to empower legal careers by offering a carefully curated platform 
        where quality, relevance, and transparency are our guiding principles.
      </p>
      <p className="max-w-3xl text-lg text-gray-600 mt-4 text-center">
        Whether you&apos;re starting your legal career or looking to advance to a higher role, 
        Gavel is here to help you find the right opportunity. We believe in providing an 
        intuitive, professional space that meets the needs of both job seekers and employers.
      </p>
    </div>
  );
}
