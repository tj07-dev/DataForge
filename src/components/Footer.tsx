import { motion } from 'framer-motion';
import { Laptop } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...{
        className:
          'w-full py-4   dark:bg-opacity-10 backdrop-filter backdrop-blur-sm  shadow-sm  rounded-lg z-50 flex justify-evenly',
      }}
    >
      <h1 className="text-sm ml-2 flex text-center mb-0">
        Designed and Developed by{'  '}
        <Link
          to="https://tj-dev.vercel.app/"
          className=" font-bold ml-1.5 flex hover:text-green-400"
        >
          Tanmay Jain <Laptop className="ml-2 w-4" />
        </Link>
      </h1>
    </motion.footer>
  );
};
