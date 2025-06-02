import Link from "next/link";
import React from "react";
import Image from "next/image";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-primary/90 text-white py-20 w-full">
      {" "}
      <div className="container mx-auto px-6 md:px-8 max-w-6xl">
        {/* Main footer content */}
        <div className="flex flex-col items-center justify-center space-y-16">
          {/* Logo and Contact Information Side by Side */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24 w-full">
            {/* Logo and description */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/logo.png"
                alt="Handmade Logo"
                width={240}
                height={80}
                className="mb-8"
              />
              <p className="text-2xl mb-8 opacity-90 max-w-md leading-relaxed font-medium">
                إبداع حرفي وحرفية تكمل الحكاية
              </p>
            </div>

            {/* Contact Information */}
            <div className="text-center lg:text-right" dir="rtl">
              <h3 className="text-3xl font-bold mb-10 text-secondary-lighter">
                معلومات التواصل
              </h3>
              <ul className="space-y-8">
                <li className="flex items-center justify-center lg:justify-start gap-4">
                  <FaEnvelope className="text-2xl text-secondary-lighter" />
                  <span className="text-xl font-medium">
                    contact@Handmade.com
                  </span>
                </li>
                <li className="flex items-center justify-center lg:justify-start gap-4">
                  <FaPhone className="text-2xl text-secondary-lighter" />
                  <span className="text-xl font-medium" dir="ltr">
                    +2010123456
                  </span>
                </li>
                <li className="flex items-center justify-center lg:justify-start gap-4">
                  <FaMapMarkerAlt className="text-2xl text-secondary-lighter" />
                  <span className="text-xl font-medium">Egypt, Cairo</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-8">
            <Link
              href="https://facebook.com"
              className="hover:text-secondary-lighter transition-all duration-300 p-4 hover:bg-white/10 rounded-full hover:scale-110"
            >
              <FaFacebook size={32} />
            </Link>
            <Link
              href="https://twitter.com"
              className="hover:text-secondary-lighter transition-all duration-300 p-4 hover:bg-white/10 rounded-full hover:scale-110"
            >
              <FaTwitter size={32} />
            </Link>
            <Link
              href="https://instagram.com"
              className="hover:text-secondary-lighter transition-all duration-300 p-4 hover:bg-white/10 rounded-full hover:scale-110"
            >
              <FaInstagram size={32} />
            </Link>
            <Link
              href="https://linkedin.com"
              className="hover:text-secondary-lighter transition-all duration-300 p-4 hover:bg-white/10 rounded-full hover:scale-110"
            >
              <FaLinkedin size={32} />
            </Link>
            <Link
              href="https://youtube.com"
              className="hover:text-secondary-lighter transition-all duration-300 p-4 hover:bg-white/10 rounded-full hover:scale-110"
            >
              <FaYoutube size={32} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
