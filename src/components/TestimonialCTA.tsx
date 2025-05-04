import React from "react";
import { motion } from "framer-motion";

interface TestimonialCTAProps {
  quote: string;
  author: string;
  authorTitle: string;
  ctaText: string;
  ctaLink: string;
}

const TestimonialCTA: React.FC<TestimonialCTAProps> = ({
  quote,
  author,
  authorTitle,
  ctaText,
  ctaLink,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-10 my-16">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            d="M10,30 Q50,10 90,30 T170,30 T250,30 T330,30 T410,30 T490,30"
          />
          <path
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            d="M10,50 Q50,30 90,50 T170,50 T250,50 T330,50 T410,50 T490,50"
          />
          <path
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            d="M10,70 Q50,50 90,70 T170,70 T250,70 T330,70 T410,70 T490,70"
          />
          <path
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            d="M10,90 Q50,70 90,90 T170,90 T250,90 T330,90 T410,90 T490,90"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <svg
            className="w-12 h-12 mx-auto mb-4 text-blue-300"
            fill="currentColor"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>

          <p className="text-xl md:text-2xl font-medium italic mb-8 rtl">
            {quote}
          </p>

          <div className="flex flex-col items-center">
            <p className="font-bold text-lg">{author}</p>
            <p className="text-blue-300">{authorTitle}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <a
            href={ctaLink}
            className="inline-block bg-white text-blue-900 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
          >
            {ctaText}
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default TestimonialCTA;
