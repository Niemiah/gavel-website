"use client";
import { useRouter } from "next/navigation";

export default function Contact() {
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
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Contact Us</h1>
      <p className="max-w-3xl text-xl text-gray-700 text-center">
        Have questions, feedback, or need assistance? We&apos;d love to hear from you.
      </p>
      <p className="max-w-3xl text-lg text-gray-600 mt-4 text-center">
        You can reach us directly at{" "}
        <a href="mailto:info@gaveljobs.com" className="text-blue-500 underline">
          info@gaveljobs.com
        </a>
      </p>
    </div>
  );
}
