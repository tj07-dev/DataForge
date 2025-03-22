import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      inset: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 50,
    }}
  >
    <motion.div
      initial={{ scale: 0.9, y: -50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: -50 }}
      {...{
        className:
          'bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto',
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold  dark:">{title}</h3>
        <button onClick={onClose} className=" hover: dark:">
          <X className="h-6 w-6" />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);
