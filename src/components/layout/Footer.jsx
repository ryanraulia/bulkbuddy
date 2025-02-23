import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t-2 border-amber-500 text-white py-8 mt-auto" role="contentinfo">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
        <div>
          <h2 className="text-3xl font-extrabold text-amber-400">
            Bulk<span className="text-white">Buddy</span>
          </h2>
          <p className="mt-2 text-gray-300 text-sm">Your personalized meal planning solution</p>
        </div>

        <nav className="mt-4 md:mt-0 flex space-x-6 text-lg font-medium" aria-label="Footer navigation">
          {["Home", "Calculators", "Recipes", "Tips", "Contact"].map(label => (
            <Link
              key={label}
              to={`/${label === "Home" ? "" : label.toLowerCase()}`}
              className="text-white hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg p-2 transition duration-300"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 md:mt-0 flex space-x-4" role="list" aria-label="Social media links">
          {[
            { icon: FaFacebookF, label: "Facebook" },
            { icon: FaInstagram, label: "Instagram" },
            { icon: FaTwitter, label: "Twitter" },
            { icon: FaYoutube, label: "YouTube" }
          ].map(({ icon: Icon, label }) => (
            <a
              key={label}
              href="#"
              className="text-gray-300 hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-full p-2 transition duration-300"
              aria-label={`Visit our ${label} page`}
            >
              <Icon size={20} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-300 text-sm">
        &copy; {new Date().getFullYear()} BulkBuddy. All rights reserved.
      </div>
    </footer>
  );
}