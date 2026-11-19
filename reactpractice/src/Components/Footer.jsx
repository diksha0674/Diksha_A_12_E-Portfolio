import React from "react";
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#fdfcf9] text-gray-800 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Logo & Description */}
        <div>
          <h1 className="text-3xl font-bold font-serif mb-4">
            BOOK<span className="font-normal">SAW</span>
          </h1>
          <p className="leading-relaxed">
            Welcome to BookSaw, your ultimate source for reading books online.
            Uncover a world of fascinating stories, immerse yourself in a sea of
            emotions, and discover new worlds through our virtual platform. .
          </p>
        </div>

        {/* About Us */}
        <div>
          <h3 className="font-semibold text-lg mb-3">About Us</h3>
          <ul className="space-y-2">
            <li>vision</li>
            <li>articles</li>
            <li>careers</li>
            <li>service terms</li>
            <li>donate</li>
          </ul>
        </div>

        {/* Discover */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Discover</h3>
          <ul className="space-y-2">
            <li>Home</li>
            <li>Books</li>
            <li>Authors</li>
            <li>Subjects</li>
            <li>Advanced Search</li>
          </ul>
        </div>

        {/* My Account */}
        <div>
          <h3 className="font-semibold text-lg mb-3">My Account</h3>
          <ul className="space-y-2">
            <li>Sign In</li>
            <li>View Cart</li>
            <li>My Wishlist</li>
            <li>Track My Order</li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Help</h3>
          <ul className="space-y-2">
            <li>Help center</li>
            <li>Report a problem</li>
            <li>Suggesting edits</li>
            <li>Contact us</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 mt-4 pt-4 px-6 pb-6 flex flex-col md:flex-row justify-between items-center text-gray-600">
        <p>
          © 2022 All rights reserved.
          <span className="text-orange-500"></span>
        </p>
        <div className="flex gap-4 text-lg mt-4 md:mt-0">
          <FaFacebookF className="cursor-pointer hover:text-blue-500" />
          <FaTwitter className="cursor-pointer hover:text-blue-400" />
          <FaYoutube className="cursor-pointer hover:text-red-500" />
          <FaInstagram className="cursor-pointer hover:text-blue-600" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
