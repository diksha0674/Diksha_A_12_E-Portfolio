import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaBehance,
  FaUser,
  FaShoppingBag,
  FaSearch,
  FaInstagram,
} from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";

const Abcd = () => {
  return (
    <div className="bg-gray-200 text-gray-700 font-sans">
      {/* Top Row: Social + Account */}
      <div className="flex justify-between items-center px-6 py-2 text-sm">
        <div className="flex gap-4">
          <FaFacebookF />
          <FaTwitter />
          <FaYoutube />
          <FaInstagram />
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-1">
            <FaUser />
            <span>Account</span>
          </div>
          <div className="flex items-center gap-1">
            <FaShoppingBag />
            <span>Cart:(0 $)</span>
          </div>
          <FaSearch className="cursor-pointer" />
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex justify-between items-center border-t px-6 py-4">
        {/* Logo */}
        <div className="text-5xl font-serif font-bold">
          BOOK<span className="font-normal">SAW</span>
        </div>

        {/* Nav Links */}
        <div className="flex gap-6 uppercase text-sm">
          <Link to="/" className="text-orange-500 font-semibold cursor-pointer">
            Home
          </Link>

          <div className="flex items-center gap-1 cursor-pointer">
            <span>Pages</span>
            <MdKeyboardArrowDown />
          </div>

          <Link to="/featured" className="cursor-pointer">
            Featured
          </Link>
          <Link to="/popular" className="cursor-pointer">
            Popular
          </Link>
          <Link to="/offer" className="cursor-pointer">
            Offer
          </Link>
          <Link to="/signpage" className="cursor-pointer">
            SignUp
          </Link>
          <Link to="/download" className="cursor-pointer">
            Download App
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Abcd;
